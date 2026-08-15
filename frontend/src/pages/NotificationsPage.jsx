import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationsApi";

import "./NotificationsPage.css";


// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value
) {

  if (!value) {
    return "Unknown";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }


  return date.toLocaleString();
}


function getTypeLabel(
  type
) {

  if (
    type ===
    "reading_ready"
  ) {

    return "Reading Ready";

  }


  return "Notification";
}


// ============================================================
// NOTIFICATIONS PAGE
// ============================================================

function NotificationsPage() {

  const [
    notifications,
    setNotifications,
  ] = useState([]);


  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);


  const [
    filter,
    setFilter,
  ] = useState("all");


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    activeAction,
    setActiveAction,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  // ==========================================================
  // LOAD NOTIFICATIONS
  // ==========================================================

  const loadNotifications =
    useCallback(
      async () => {

        setIsLoading(
          true
        );


        setError("");


        try {

          const [
            notificationData,
            countData,
          ] =
            await Promise.all([

              getNotifications({
                limit: 100,

                unreadOnly:
                  filter ===
                  "unread",
              }),

              getUnreadNotificationCount(),
            ]);


          setNotifications(
            Array.isArray(
              notificationData
            )
              ? notificationData
              : []
          );


          setUnreadCount(
            Number(
              countData
                ?.unread_count
            ) || 0
          );


        } catch (
          loadError
        ) {

          console.error(
            "NOTIFICATIONS LOAD ERROR:",
            loadError
          );


          setNotifications([]);


          setError(
            loadError?.message ||
            "Notifications could not be loaded."
          );


        } finally {

          setIsLoading(
            false
          );

        }
      },

      [
        filter,
      ]
    );


  // ==========================================================
  // INITIAL LOAD / FILTER CHANGE
  // ==========================================================

  useEffect(() => {

    loadNotifications();

  }, [
    loadNotifications,
  ]);


  // ==========================================================
  // MARK ONE READ
  // ==========================================================

  const handleMarkRead =
    async (
      notificationId
    ) => {

      setActiveAction(
        `read-${notificationId}`
      );


      setError("");

      setSuccessMessage("");


      try {

        await markNotificationRead(
          notificationId
        );


        await loadNotifications();


      } catch (
        actionError
      ) {

        console.error(
          "MARK NOTIFICATION ERROR:",
          actionError
        );


        setError(
          actionError?.message ||
          "Notification could not be updated."
        );


      } finally {

        setActiveAction("");

      }
    };


  // ==========================================================
  // MARK ALL READ
  // ==========================================================

  const handleMarkAllRead =
    async () => {

      setActiveAction(
        "read-all"
      );


      setError("");

      setSuccessMessage("");


      try {

        const response =
          await markAllNotificationsRead();


        setSuccessMessage(
          response?.updated_count > 0
            ? (
                `${response.updated_count} notification(s) marked as read.`
              )
            : "There are no unread notifications."
        );


        await loadNotifications();


      } catch (
        actionError
      ) {

        console.error(
          "MARK ALL ERROR:",
          actionError
        );


        setError(
          actionError?.message ||
          "Notifications could not be updated."
        );


      } finally {

        setActiveAction("");

      }
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="notifications-page">

      {/* HEADER */}

      <div className="notifications-header">

        <div>

          <p className="notifications-eyebrow">
            IN-APP NOTIFICATION CENTER
          </p>


          <h1>
            Notifications
          </h1>


          <p className="notifications-description">

            Review updates generated by
            your Palmistry & Tarot
            Intelligence Platform activity.

          </p>

        </div>


        <div className="notifications-header-actions">

          <div className="notifications-unread-badge">

            {unreadCount}

            <span>
              Unread
            </span>

          </div>


          <button
            type="button"
            className="notifications-mark-all"
            onClick={
              handleMarkAllRead
            }
            disabled={
              activeAction ===
              "read-all" ||
              unreadCount === 0
            }
          >

            {
              activeAction ===
              "read-all"
                ? "Updating..."
                : "Mark All Read"
            }

          </button>

        </div>

      </div>


      {/* NOTICE */}

      <div className="notifications-notice">

        <strong>
          Private in-app notifications
        </strong>


        <p>

          Notifications shown here belong
          only to your authenticated
          account. This prototype does not
          send email, SMS or mobile push
          notifications.

        </p>

      </div>


      {/* FILTER */}

      <div className="notifications-toolbar">

        <div className="notifications-tabs">

          <button
            type="button"
            className={
              filter === "all"
                ? "notifications-tab notifications-tab-active"
                : "notifications-tab"
            }
            onClick={
              () =>
                setFilter(
                  "all"
                )
            }
          >
            All
          </button>


          <button
            type="button"
            className={
              filter === "unread"
                ? "notifications-tab notifications-tab-active"
                : "notifications-tab"
            }
            onClick={
              () =>
                setFilter(
                  "unread"
                )
            }
          >
            Unread
          </button>

        </div>


        <button
          type="button"
          className="notifications-refresh"
          onClick={
            loadNotifications
          }
          disabled={
            isLoading
          }
        >
          {
            isLoading
              ? "Refreshing..."
              : "Refresh"
          }
        </button>

      </div>


      {/* MESSAGES */}

      {error && (

        <div className="notifications-error">

          <strong>
            Notification action failed
          </strong>


          <p>
            {error}
          </p>

        </div>

      )}


      {successMessage && (

        <div className="notifications-success">

          {successMessage}

        </div>

      )}


      {/* CONTENT */}

      {isLoading ? (

        <div className="notifications-empty">

          <h3>
            Loading notifications...
          </h3>

        </div>

      ) : notifications.length === 0 ? (

        <div className="notifications-empty">

          <h3>
            {
              filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"
            }
          </h3>


          <p>

            {
              filter === "unread"
                ? (
                    "You have read all of your current notifications."
                  )
                : (
                    "Generate a complete reading and a notification will appear here."
                  )
            }

          </p>


          <Link to="/reading">
            Go to Reading Studio
          </Link>

        </div>

      ) : (

        <div className="notifications-list">

          {notifications.map(
            (
              notification
            ) => (

              <article
                key={
                  notification.id
                }
                className={
                  notification.is_read
                    ? "notification-card notification-card-read"
                    : "notification-card notification-card-unread"
                }
              >

                <div className="notification-card-top">

                  <div>

                    <div className="notification-type-row">

                      <span className="notification-type">

                        {
                          getTypeLabel(
                            notification
                              .notification_type
                          )
                        }

                      </span>


                      {!notification.is_read && (

                        <span className="notification-new-badge">
                          New
                        </span>

                      )}

                    </div>


                    <h3>
                      {
                        notification
                          .title
                      }
                    </h3>

                  </div>


                  <small>

                    {
                      formatDate(
                        notification
                          .created_at
                      )
                    }

                  </small>

                </div>


                <p className="notification-message">

                  {
                    notification
                      .message
                  }

                </p>


                <div className="notification-actions">

                  {
                    notification
                      .related_reading_session_id && (

                      <Link
                        to="/history"
                        className="notification-history-link"
                      >
                        View Reading
                      </Link>

                    )
                  }


                  {!notification.is_read && (

                    <button
                      type="button"
                      onClick={
                        () =>
                          handleMarkRead(
                            notification.id
                          )
                      }
                      disabled={
                        Boolean(
                          activeAction
                        )
                      }
                    >

                      {
                        activeAction ===
                        `read-${notification.id}`
                          ? "Updating..."
                          : "Mark as Read"
                      }

                    </button>

                  )}

                </div>


                {notification.is_read && (

                  <div className="notification-read-info">

                    Read

                    {
                      notification.read_at
                        ? (
                            ` • ${formatDate(
                              notification.read_at
                            )}`
                          )
                        : ""
                    }

                  </div>

                )}

              </article>

            )
          )}

        </div>

      )}

    </div>
  );
}


export default NotificationsPage;