import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AssignmentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        if (active && response.data.success) {
          setNotifications(response.data.notifications || []);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load notifications.",
          );
        }
      }
    };

    void loadNotifications();
    const intervalId = window.setInterval(
      () => void loadNotifications(),
      60_000,
    );
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.readAt,
  ).length;

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(
        `/notifications/${notificationId}/read`,
      );
      if (response.data.success) {
        setNotifications((previous) =>
          previous.map((notification) =>
            notification._id === notificationId
              ? response.data.notification
              : notification,
          ),
        );
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to mark notification as read.",
      );
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Notifications
        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <h2 className="font-semibold text-slate-900">Notifications</h2>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {notifications.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              You are all caught up.
            </p>
          ) : (
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification._id}>
                  <Link
                    to={notification.link}
                    onClick={() => {
                      if (!notification.readAt) {
                        void markAsRead(notification._id);
                      }
                      setOpen(false);
                    }}
                    className={`block rounded-xl p-3 hover:bg-slate-50 ${
                      notification.readAt ? "bg-white" : "bg-indigo-50"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-slate-900">
                      {notification.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      {notification.message}
                    </span>
                    <time className="mt-2 block text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AssignmentNotifications;
