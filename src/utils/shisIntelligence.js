// ============================================================
// SHIS CENTRAL INTELLIGENCE ENGINE
// ============================================================

// ------------------------------------------------------------
// BASIC RECORD HELPERS
// ------------------------------------------------------------

export function groupRecordsByDate(records) {
  return records.reduce((groups, record) => {
    if (!groups[record.checkin_date]) {
      groups[record.checkin_date] = [];
    }

    groups[record.checkin_date].push(record);

    return groups;
  }, {});
}

export function getDailyRecords(records) {
  const grouped = groupRecordsByDate(records);

  return Object.keys(grouped)
    .sort()
    .map((date) => ({
      date,
      morning: grouped[date].find(
        (record) => record.checkin_type === "morning"
      ),
      evening: grouped[date].find(
        (record) => record.checkin_type === "evening"
      ),
      night: grouped[date].find(
        (record) => record.checkin_type === "night"
      ),
    }));
}

export function getNumericValues(dailyRecords, field) {
  return dailyRecords
    .map((day) => Number(day.evening?.[field]))
    .filter((value) => !Number.isNaN(value));
}

export function getDayRatings(dailyRecords) {
  return dailyRecords
    .map((day) => Number(day.night?.day_rating))
    .filter((value) => !Number.isNaN(value));
}

// ------------------------------------------------------------
// RECENT TREND INTELLIGENCE
// ------------------------------------------------------------

export function detectTrendInsights(records) {
  const dailyRecords = getDailyRecords(records);

  if (dailyRecords.length < 3) {
    return [
      {
        type: "info",
        icon: "📊",
        title: "More data needed",
        message:
          "Keep completing your daily check-ins. SHIS needs several days of data before it can identify meaningful wellbeing patterns.",
      },
    ];
  }

  const recentDays = dailyRecords.slice(-3);

  const highStress = recentDays.every(
    (day) => Number(day.evening?.stress_level) >= 3
  );

  const highAcademicPressure = recentDays.every(
    (day) => Number(day.evening?.academic_pressure) >= 3
  );

  const lowEnergy = recentDays.every(
    (day) => Number(day.evening?.energy_level) <= 2
  );

  const lowDayRating = recentDays.every(
    (day) => Number(day.night?.day_rating) <= 2
  );

  const insights = [];

  if (highStress) {
    insights.push({
      type: "attention",
      icon: "⚡",
      title: "Repeated higher stress",
      message:
        "Higher stress has been recorded across your most recent check-ins.",
    });
  }

  if (highAcademicPressure) {
    insights.push({
      type: "attention",
      icon: "📚",
      title: "Repeated academic pressure",
      message:
        "Higher academic pressure has been recorded across your most recent check-ins.",
    });
  }

  if (lowEnergy) {
    insights.push({
      type: "attention",
      icon: "🔋",
      title: "Repeated lower energy",
      message:
        "Lower energy has been recorded across your most recent check-ins.",
    });
  }

  if (lowDayRating) {
    insights.push({
      type: "attention",
      icon: "🌙",
      title: "Repeated lower day ratings",
      message:
        "Lower day ratings have been recorded across your most recent check-ins.",
    });
  }

  if (highAcademicPressure && lowEnergy) {
    insights.push({
      type: "pattern",
      icon: "📚",
      title: "Academic pressure and lower energy",
      message:
        "Higher academic pressure and lower energy have appeared together across your recent check-ins.",
    });
  }

  if (highStress && lowEnergy) {
    insights.push({
      type: "pattern",
      icon: "⚡",
      title: "Stress and lower energy",
      message:
        "Higher stress and lower energy have appeared together across your recent check-ins.",
    });
  }

  if (highStress && lowDayRating) {
    insights.push({
      type: "pattern",
      icon: "⚡",
      title: "Stress and lower day ratings",
      message:
        "Higher stress and lower day ratings have appeared together across your recent check-ins.",
    });
  }

  if (highAcademicPressure && lowDayRating) {
    insights.push({
      type: "pattern",
      icon: "📚",
      title: "Academic pressure and lower day ratings",
      message:
        "Higher academic pressure and lower day ratings have appeared together across your recent check-ins.",
    });
  }

  if (
    highStress &&
    highAcademicPressure &&
    lowEnergy
  ) {
    insights.push({
      type: "pattern",
      icon: "🧠",
      title: "Multiple wellbeing signals",
      message:
        "Higher stress, higher academic pressure, and lower energy have appeared together across your recent check-ins.",
    });
  }

  const morningDays = recentDays.filter(
    (day) => day.morning
  );

  const poorSleepCount = morningDays.filter(
    (day) =>
      day.morning?.sleep_quality === "Poor" ||
      day.morning?.sleep_quality === "Okay"
  ).length;

  const tiredCount = morningDays.filter(
    (day) =>
      day.morning?.rested_feeling ===
        "Not rested" ||
      day.morning?.rested_feeling ===
        "A little tired"
  ).length;

  if (
    morningDays.length >= 3 &&
    poorSleepCount >= 2 &&
    lowEnergy
  ) {
    insights.push({
      type: "pattern",
      icon: "😴",
      title: "Sleep and energy pattern",
      message:
        "Lower sleep quality has appeared alongside lower energy in your recent check-ins.",
    });
  }

  if (
    morningDays.length >= 3 &&
    tiredCount >= 2 &&
    lowEnergy
  ) {
    insights.push({
      type: "pattern",
      icon: "😴",
      title: "Rest and energy pattern",
      message:
        "Feeling less rested has appeared alongside lower energy in your recent check-ins.",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "positive",
      icon: "✓",
      title: "No repeated concern detected",
      message:
        "Your recent check-ins do not currently show a repeated pattern that needs attention.",
    });
  }

  return insights;
}

export function getPrimaryInsight(insights) {
  return (
    insights.find(
      (insight) => insight.type === "attention"
    ) ||
    insights.find(
      (insight) => insight.type === "pattern"
    ) ||
    insights.find(
      (insight) => insight.type === "positive"
    ) ||
    insights.find(
      (insight) => insight.type === "info"
    ) ||
    null
  );
}

// ------------------------------------------------------------
// MONTHLY HELPERS
// ------------------------------------------------------------

function getNumericValuesFromRecords(records, field) {
  return records
    .map((record) => Number(record[field]))
    .filter((value) => !Number.isNaN(value));
}

function getAverage(records, field) {
  const values = getNumericValuesFromRecords(
    records,
    field
  );

  if (!values.length) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return total / values.length;
}

function calculateMonthlyData(records) {
  const eveningRecords = records.filter(
    (record) => record.checkin_type === "evening"
  );

  const nightRecords = records.filter(
    (record) => record.checkin_type === "night"
  );

  return {
    energy: getAverage(
      eveningRecords,
      "energy_level"
    ),
    stress: getAverage(
      eveningRecords,
      "stress_level"
    ),
    academicPressure: getAverage(
      eveningRecords,
      "academic_pressure"
    ),
    dayRating: getAverage(
      nightRecords,
      "day_rating"
    ),
  };
}

// ------------------------------------------------------------
// PERSISTENT PATTERNS
// ------------------------------------------------------------

export function detectPersistentPatterns(records) {
  const monthlyGroups = {};

  records.forEach((record) => {
    const month =
      record.checkin_date.slice(0, 7);

    if (!monthlyGroups[month]) {
      monthlyGroups[month] = [];
    }

    monthlyGroups[month].push(record);
  });

  const monthlyData = Object.keys(monthlyGroups)
    .sort()
    .map((month) => ({
      month,
      ...calculateMonthlyData(
        monthlyGroups[month]
      ),
    }));

  const persistentPatterns = [];

  // ----------------------------------------------------------
  // INDIVIDUAL LONG-TERM PATTERNS
  // ----------------------------------------------------------

  const stressMonths = monthlyData.filter(
    (month) =>
      month.stress !== null &&
      month.stress >= 3
  );

  const lowEnergyMonths = monthlyData.filter(
    (month) =>
      month.energy !== null &&
      month.energy <= 2
  );

  const academicPressureMonths =
    monthlyData.filter(
      (month) =>
        month.academicPressure !== null &&
        month.academicPressure >= 3
    );

  const lowDayRatingMonths =
    monthlyData.filter(
      (month) =>
        month.dayRating !== null &&
        month.dayRating <= 2
    );

  if (stressMonths.length >= 2) {
    persistentPatterns.push({
      category: "individual",
      icon: "⚡",
      title:
        "Persistent higher stress pattern",
      description:
        "Higher recorded stress levels appeared in multiple months.",
      months: stressMonths.map(
        (month) => month.month
      ),
    });
  }

  if (lowEnergyMonths.length >= 2) {
    persistentPatterns.push({
      category: "individual",
      icon: "🔋",
      title:
        "Persistent lower energy pattern",
      description:
        "Lower recorded energy levels appeared in multiple months.",
      months: lowEnergyMonths.map(
        (month) => month.month
      ),
    });
  }

  if (
    academicPressureMonths.length >= 2
  ) {
    persistentPatterns.push({
      category: "individual",
      icon: "📚",
      title:
        "Persistent academic pressure pattern",
      description:
        "Higher recorded academic pressure appeared in multiple months.",
      months: academicPressureMonths.map(
        (month) => month.month
      ),
    });
  }

  if (lowDayRatingMonths.length >= 2) {
    persistentPatterns.push({
      category: "individual",
      icon: "🌙",
      title:
        "Persistent lower day-rating pattern",
      description:
        "Lower recorded day ratings appeared in multiple months.",
      months: lowDayRatingMonths.map(
        (month) => month.month
      ),
    });
  }

  // ----------------------------------------------------------
  // CONTEXT-AWARE RELATIONSHIPS
  // ----------------------------------------------------------

  const stressEnergyMonths =
    monthlyData.filter(
      (month) =>
        month.stress !== null &&
        month.energy !== null &&
        month.stress >= 3 &&
        month.energy <= 2
    );

  if (stressEnergyMonths.length >= 2) {
    persistentPatterns.push({
      category: "context",
      icon: "⚡",
      title:
        "Stress and lower energy appeared together",
      description:
        "Higher recorded stress and lower recorded energy appeared together across multiple months.",
      months: stressEnergyMonths.map(
        (month) => month.month
      ),
    });
  }

  const academicEnergyMonths =
    monthlyData.filter(
      (month) =>
        month.academicPressure !== null &&
        month.energy !== null &&
        month.academicPressure >= 3 &&
        month.energy <= 2
    );

  if (academicEnergyMonths.length >= 2) {
    persistentPatterns.push({
      category: "context",
      icon: "📚",
      title:
        "Academic pressure and lower energy appeared together",
      description:
        "Higher recorded academic pressure and lower recorded energy appeared together across multiple months.",
      months: academicEnergyMonths.map(
        (month) => month.month
      ),
    });
  }

  const stressAcademicMonths =
    monthlyData.filter(
      (month) =>
        month.stress !== null &&
        month.academicPressure !== null &&
        month.stress >= 3 &&
        month.academicPressure >= 3
    );

  if (stressAcademicMonths.length >= 2) {
    persistentPatterns.push({
      category: "context",
      icon: "🧠",
      title:
        "Stress and academic pressure appeared together",
      description:
        "Higher recorded stress and higher academic pressure appeared together across multiple months.",
      months: stressAcademicMonths.map(
        (month) => month.month
      ),
    });
  }

  const stressDayRatingMonths =
    monthlyData.filter(
      (month) =>
        month.stress !== null &&
        month.dayRating !== null &&
        month.stress >= 3 &&
        month.dayRating <= 2
    );

  if (stressDayRatingMonths.length >= 2) {
    persistentPatterns.push({
      category: "context",
      icon: "⚡",
      title:
        "Stress and lower day ratings appeared together",
      description:
        "Higher recorded stress and lower recorded day ratings appeared together across multiple months.",
      months: stressDayRatingMonths.map(
        (month) => month.month
      ),
    });
  }

  const academicDayRatingMonths =
    monthlyData.filter(
      (month) =>
        month.academicPressure !== null &&
        month.dayRating !== null &&
        month.academicPressure >= 3 &&
        month.dayRating <= 2
    );

  if (
    academicDayRatingMonths.length >= 2
  ) {
    persistentPatterns.push({
      category: "context",
      icon: "📚",
      title:
        "Academic pressure and lower day ratings appeared together",
      description:
        "Higher recorded academic pressure and lower recorded day ratings appeared together across multiple months.",
      months: academicDayRatingMonths.map(
        (month) => month.month
      ),
    });
  }

  return persistentPatterns;
}

// ------------------------------------------------------------
// TIME-AWARE INTELLIGENCE
// ------------------------------------------------------------

function getRecentRecords(records, days = 7) {
  const grouped = groupRecordsByDate(records);

  const dates = Object.keys(grouped)
    .sort()
    .reverse()
    .slice(0, days);

  return dates.flatMap(
    (date) => grouped[date]
  );
}

function getPreviousRecords(
  records,
  days = 7
) {
  const grouped = groupRecordsByDate(records);

  const dates = Object.keys(grouped)
    .sort()
    .reverse()
    .slice(days, days * 2);

  return dates.flatMap(
    (date) => grouped[date]
  );
}

function getRecentAverage(
  records,
  field,
  checkinType
) {
  const filtered = records.filter(
    (record) =>
      record.checkin_type === checkinType
  );

  return getAverage(filtered, field);
}

export function buildTimeAwareInsight(
  records,
  persistentPatterns
) {
  const recentRecords = getRecentRecords(
    records,
    7
  );

  const previousRecords =
    getPreviousRecords(records, 7);

  if (!recentRecords.length) {
    return {
      title:
        "SHIS is still building your recent picture",
      description:
        "Continue completing your daily check-ins so SHIS can compare recent changes with your earlier recorded wellbeing.",
      nextStep:
        "Keep completing your daily check-ins consistently.",
      status: "neutral",
    };
  }

  const recentStress = getRecentAverage(
    recentRecords,
    "stress_level",
    "evening"
  );

  const previousStress = getRecentAverage(
    previousRecords,
    "stress_level",
    "evening"
  );

  const recentEnergy = getRecentAverage(
    recentRecords,
    "energy_level",
    "evening"
  );

  const previousEnergy = getRecentAverage(
    previousRecords,
    "energy_level",
    "evening"
  );

  const recentAcademicPressure =
    getRecentAverage(
      recentRecords,
      "academic_pressure",
      "evening"
    );

  const previousAcademicPressure =
    getRecentAverage(
      previousRecords,
      "academic_pressure",
      "evening"
    );

  const recentDayRating = getRecentAverage(
    recentRecords,
    "day_rating",
    "night"
  );

  // Recent stress
  if (
    recentStress !== null &&
    recentStress >= 3
  ) {
    if (
      previousStress !== null &&
      recentStress < previousStress
    ) {
      return {
        title:
          "SHIS is noticing some recent improvement",
        description:
          "Stress has remained relatively high in the most recent recorded days, but the recent average is lower than the earlier comparison period.",
        nextStep:
          "Continue monitoring your stress while maintaining the routines that appear manageable for you.",
        status: "improving",
      };
    }

    return {
      title:
        "SHIS is noticing a recent stress pattern",
      description:
        "Higher stress has been recorded during the most recent days of your check-in history.",
      nextStep:
        "Keep monitoring your stress and consider reviewing your current workload and recovery time.",
      status: "attention",
    };
  }

  // Recent academic pressure
  if (
    recentAcademicPressure !== null &&
    recentAcademicPressure >= 3
  ) {
    if (
      previousAcademicPressure !== null &&
      recentAcademicPressure <
        previousAcademicPressure
    ) {
      return {
        title:
          "SHIS is noticing some recent improvement",
        description:
          "Academic pressure remains noticeable in the recent data, but the recent average is lower than the earlier comparison period.",
        nextStep:
          "Continue monitoring your academic pressure and maintain a manageable study and recovery routine.",
        status: "improving",
      };
    }

    return {
      title:
        "SHIS is noticing recent academic pressure",
      description:
        "Higher academic pressure has been recorded during the most recent days of your check-in history.",
      nextStep:
        "Consider reviewing your workload, study schedule, and recovery time.",
      status: "attention",
    };
  }

  // Recent low energy
  if (
    recentEnergy !== null &&
    recentEnergy <= 2
  ) {
    if (
      previousEnergy !== null &&
      recentEnergy > previousEnergy
    ) {
      return {
        title:
          "SHIS is noticing some recent improvement",
        description:
          "Energy remains relatively low in the recent data, but the recent average is higher than the earlier comparison period.",
        nextStep:
          "Continue paying attention to sleep, recovery, daily activity, and how your energy changes.",
        status: "improving",
      };
    }

    return {
      title:
        "SHIS is noticing recent lower energy",
      description:
        "Lower energy has been recorded during the most recent days of your check-in history.",
      nextStep:
        "Pay attention to your sleep, recovery, activity, and daily routine over the next few days.",
      status: "attention",
    };
  }

  // Recent lower day rating
  if (
    recentDayRating !== null &&
    recentDayRating <= 2
  ) {
    return {
      title:
        "SHIS is noticing lower recent day ratings",
      description:
        "Lower day ratings have appeared during the most recent recorded days.",
      nextStep:
        "Continue recording your check-ins and pay attention to which parts of your daily routine coincide with lower ratings.",
      status: "attention",
    };
  }

  // Persistent pattern without a recent spike
  if (persistentPatterns.length > 0) {
    const contextPattern =
      persistentPatterns.find(
        (pattern) =>
          pattern.category === "context"
      );

    if (contextPattern) {
      return {
        title:
          "SHIS is noticing a longer-term relationship",
        description:
          `${contextPattern.description} It has appeared across ${contextPattern.months.length} months of your recorded data, without assuming that one factor caused the other.`,
        nextStep:
          "Continue monitoring these signals together and look for changes in the coming weeks.",
        status: "long-term",
      };
    }

    return {
      title:
        "SHIS is noticing a longer-term pattern",
      description:
        `${persistentPatterns[0].description} This pattern has appeared across ${persistentPatterns[0].months.length} months of your recorded data.`,
      nextStep:
        "Continue your daily check-ins so SHIS can determine whether the pattern continues, improves, or changes.",
      status: "long-term",
    };
  }

  return {
    title:
      "SHIS is not seeing a repeated concern in the recent data",
    description:
      "Your recent recorded signals do not currently show one of the repeated patterns SHIS is designed to highlight.",
    nextStep:
      "Continue completing your daily check-ins so changes can be understood over time.",
    status: "neutral",
  };
}

// ------------------------------------------------------------
// LONG-TERM INTELLIGENCE SUMMARY
// ------------------------------------------------------------

export function buildPersistentInsight(
  persistentPatterns
) {
  if (!persistentPatterns.length) {
    return {
      title:
        "SHIS is still learning your longer-term pattern",
      description:
        "There is not enough repeated monthly data yet to identify a persistent pattern. Continue completing your daily check-ins so SHIS can build a clearer picture over time.",
    };
  }

  const contextPatterns =
    persistentPatterns.filter(
      (pattern) =>
        pattern.category === "context"
    );

  if (contextPatterns.length > 0) {
    const primaryPattern =
      contextPatterns[0];

    return {
      title:
        "SHIS is noticing a recurring relationship",
      description:
        `${primaryPattern.description} This relationship has been observed across ${primaryPattern.months.length} months of your recorded wellbeing data.`,
    };
  }

  if (persistentPatterns.length === 1) {
    const pattern =
      persistentPatterns[0];

    return {
      title:
        "SHIS is noticing a recurring pattern",
      description:
        `${pattern.description} This pattern has been observed across ${pattern.months.length} months of your recorded wellbeing data.`,
    };
  }

  return {
    title:
      "SHIS is noticing multiple recurring patterns",
    description:
      "More than one wellbeing pattern has appeared across multiple months of your recorded data. Looking at these patterns together can provide more context about how your wellbeing changes over time.",
  };
}

// ------------------------------------------------------------
// DISCLAIMER
// ------------------------------------------------------------

export const SHIS_INTELLIGENCE_DISCLAIMER =
  "These are patterns in your check-in data, not medical diagnoses.";