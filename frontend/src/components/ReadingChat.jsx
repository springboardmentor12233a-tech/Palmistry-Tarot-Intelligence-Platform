import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getReadingSession,
  sendPersistentFollowUp,
} from "../services/chatApi";


// ============================================================
// CLEAN AI TEXT
// ============================================================

function cleanChatText(
  text
) {
  if (!text) {
    return "";
  }

  return String(
    text
  )

    // Markdown headings
    .replace(
      /^#{1,6}\s*/gm,
      ""
    )

    // Bold
    .replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    )

    .replace(
      /__(.*?)__/g,
      "$1"
    )

    // Italic
    .replace(
      /\*(.*?)\*/g,
      "$1"
    )

    // Markdown bullets
    .replace(
      /^\s*[-*+]\s+/gm,
      ""
    )

    // Blockquotes
    .replace(
      /^\s*>\s?/gm,
      ""
    )

    // Backticks
    .replace(
      /`{1,3}/g,
      ""
    )

    // Too many blank lines
    .replace(
      /\n{3,}/g,
      "\n\n"
    )

    .trim();
}


// ============================================================
// READING CHAT
// ============================================================

function ReadingChat({
  readingResponse,
}) {

  const sessionId =
    readingResponse
      ?.reading_session_id;


  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    input,
    setInput,
  ] = useState("");


  const [
    isSending,
    setIsSending,
  ] = useState(false);


  const [
    isLoadingConversation,
    setIsLoadingConversation,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const messagesEndRef =
    useRef(null);


  // =========================================================
  // LOAD PERSISTED CHAT
  // =========================================================

  useEffect(() => {

    let cancelled = false;


    async function loadConversation() {

      if (!sessionId) {

        setMessages([]);

        return;
      }


      setIsLoadingConversation(
        true
      );

      setError("");


      try {

        const session =
          await getReadingSession(
            sessionId
          );


        if (cancelled) {
          return;
        }


        const storedMessages =
          Array.isArray(
            session?.messages
          )
            ? session.messages
            : [];


        setMessages(

          storedMessages.map(
            (message) => ({

              role:
                message.role,

              content:
                message.content,

            })
          )
        );


      } catch (loadError) {

        if (cancelled) {
          return;
        }


        console.error(
          "LOAD CHAT ERROR:",
          loadError
        );


        setError(
          loadError?.message ||
          "Saved conversation could not be loaded."
        );


      } finally {

        if (!cancelled) {

          setIsLoadingConversation(
            false
          );

        }
      }
    }


    loadConversation();


    return () => {

      cancelled = true;

    };

  }, [sessionId]);


  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }, [
    messages,
    isSending,
  ]);


  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSend =
    async (event) => {

      event.preventDefault();


      const trimmedMessage =
        input.trim();


      if (
        !trimmedMessage ||
        isSending
      ) {
        return;
      }


      if (!sessionId) {

        setError(
          "This reading does not have a saved reading session. Generate a new complete reading first."
        );

        return;
      }


      const previousMessages =
        [...messages];


      const optimisticMessage = {

        role: "user",

        content:
          trimmedMessage,

      };


      setMessages(
        [
          ...previousMessages,
          optimisticMessage,
        ]
      );


      setInput("");

      setError("");

      setIsSending(
        true
      );


      try {

        const response =
          await sendPersistentFollowUp(

            sessionId,

            trimmedMessage
          );


        if (
          !response ||
          !Array.isArray(
            response.conversation
          )
        ) {

          throw new Error(
            "The chat service returned an invalid response."
          );

        }


        setMessages(
          response.conversation
        );


      } catch (chatError) {

        console.error(
          "FOLLOW-UP CHAT ERROR:",
          chatError
        );


        setMessages(
          previousMessages
        );


        setInput(
          trimmedMessage
        );


        setError(
          chatError?.message ||
          "Your follow-up question could not be answered."
        );


      } finally {

        setIsSending(
          false
        );

      }
    };


  // =========================================================
  // ENTER TO SEND
  // =========================================================

  const handleKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();


        if (
          input.trim() &&
          !isSending
        ) {

          event.currentTarget
            .form
            ?.requestSubmit();

        }
      }
    };


  // =========================================================
  // NO SESSION
  // =========================================================

  if (!sessionId) {

    return (
      <section className="result-section">

        <p className="eyebrow">
          CONTINUE YOUR READING
        </p>


        <h2>
          Ask Follow-up Questions
        </h2>


        <div className="error-message">

          <strong>
            Reading session unavailable
          </strong>

          <p>
            This reading was not saved as
            a persistent session. Generate
            a new complete reading to use
            persistent follow-up chat.
          </p>

        </div>

      </section>
    );
  }


  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="result-section">

      <p className="eyebrow">
        CONTINUE YOUR READING
      </p>


      <h2>
        Ask Follow-up Questions
      </h2>


      <p className="section-note">

        Your conversation is saved with
        this reading and uses the same
        palm analysis and tarot cards.

      </p>


      <p className="section-note">

        Reading session #{sessionId}

      </p>


      <div className="reading-chat">


        {/* =============================================== */}
        {/* LOADING SAVED CONVERSATION */}
        {/* =============================================== */}

        {isLoadingConversation && (

          <div className="chat-intro">

            <p>
              Loading saved conversation...
            </p>

          </div>

        )}


        {/* =============================================== */}
        {/* INTRO */}
        {/* =============================================== */}

        {
          !isLoadingConversation &&
          messages.length === 0 && (

          <div className="chat-intro">

            <p>
              Your complete reading is ready.
            </p>

            <p>
              Ask another question about
              this same reading.
            </p>

            <ul>

              <li>
                Can you explain the career
                part in more detail?
              </li>

              <li>
                What should I focus on first?
              </li>

              <li>
                How does this connect to
                my tarot card?
              </li>

              <li>
                What strengths should I
                develop further?
              </li>

            </ul>

          </div>

        )}


        {/* =============================================== */}
        {/* SAVED MESSAGES */}
        {/* =============================================== */}

        <div className="chat-messages">

          {messages.map(
            (
              message,
              index
            ) => (

              <div
                key={
                  `${message.role}-${index}`
                }
                className={
                  message.role === "user"
                    ? "chat-message chat-user"
                    : "chat-message chat-assistant"
                }
              >

                <span className="chat-role">

                  {
                    message.role ===
                    "user"
                      ? "You"
                      : "AI Guide"
                  }

                </span>


                <p>

                  {
                    cleanChatText(
                      message.content
                    )
                  }

                </p>

              </div>

            )
          )}


          {/* ============================================= */}
          {/* THINKING */}
          {/* ============================================= */}

          {isSending && (

            <div
              className="
                chat-message
                chat-assistant
              "
            >

              <span className="chat-role">
                AI Guide
              </span>

              <p>
                Thinking about your
                reading...
              </p>

            </div>

          )}


          <div
            ref={
              messagesEndRef
            }
          />

        </div>


        {/* =============================================== */}
        {/* ERROR */}
        {/* =============================================== */}

        {error && (

          <div
            className="error-message"
            role="alert"
          >

            <strong>
              Message failed
            </strong>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* =============================================== */}
        {/* CHAT INPUT */}
        {/* =============================================== */}

        <form
          className="chat-input-form"
          onSubmit={
            handleSend
          }
        >

          <textarea
            value={
              input
            }
            onChange={
              (event) =>
                setInput(
                  event.target.value
                )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Ask a follow-up question about this reading..."
            rows={3}
            maxLength={1500}
            disabled={
              isSending ||
              isLoadingConversation
            }
          />


          <button
            type="submit"
            className="generate-button"
            disabled={
              isSending ||
              isLoadingConversation ||
              !input.trim()
            }
          >

            {
              isSending
                ? "Sending..."
                : "Send Question"
            }

          </button>

        </form>


        <p className="section-note">

          Press Enter to send.
          Use Shift + Enter for a new line.

        </p>


        <p className="disclaimer">

          Follow-up answers use the same
          saved palm findings and tarot
          cards. Start a new reading if
          you want new cards or a different
          palm analysis.

        </p>

      </div>

    </section>
  );
}


export default ReadingChat;