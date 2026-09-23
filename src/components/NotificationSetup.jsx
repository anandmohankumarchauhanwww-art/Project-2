import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function NotificationSetup() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function enableNotifications() {
    try {
      setStatus("loading");
      setMessage("");

      if (!("Notification" in window)) {
        setStatus("error");
        setMessage("Notifications are not supported on this device.");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setStatus("error");
        setMessage("Push notifications are not supported by this browser.");
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        setStatus("error");
        setMessage("Notification configuration is missing.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("error");
        setMessage("Notification permission was not granted.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            VAPID_PUBLIC_KEY
          ),
        });
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("error");
        setMessage("Your account could not be identified.");
        return;
      }

      const subscriptionJSON = subscription.toJSON();

      const { error } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: subscription.endpoint,
            subscription: subscriptionJSON,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,endpoint",
          }
        );

      if (error) {
        console.error("Push subscription save error:", error);

        setStatus("error");
        setMessage("Could not save notification settings.");
        return;
      }

      setStatus("success");
      setMessage("Notifications are enabled.");
    } catch (error) {
      console.error("Notification setup error:", error);

      setStatus("error");
      setMessage("Could not enable notifications.");
    }
  }

  return (
    <div className="notification-setup">
      <div>
        <h3>Stay on track with SHIS</h3>

        <p>
          Get a gentle reminder when your Morning, Evening, and Night
          check-ins are ready.
        </p>
      </div>

      {status !== "success" && (
        <button
          type="button"
          className="primary-button"
          onClick={enableNotifications}
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Enabling..."
            : "Enable Notifications"}
        </button>
      )}

      {message && (
        <p
          className={
            status === "success"
              ? "success-message"
              : "error-message"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default NotificationSetup;