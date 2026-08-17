import {
  useEffect,
  useRef,
} from "react";

import "./GoogleSignInButton.css";


const GOOGLE_CLIENT_ID =
  (
    import.meta.env
      .VITE_GOOGLE_CLIENT_ID ||
    ""
  ).trim();


function GoogleSignInButton({
  onCredential,
  disabled = false,
}) {
  const buttonContainerRef =
    useRef(null);

  const credentialHandlerRef =
    useRef(
      onCredential
    );


  // =========================================================
  // KEEP CALLBACK CURRENT
  // =========================================================

  useEffect(() => {
    credentialHandlerRef.current =
      onCredential;
  }, [onCredential]);


  // =========================================================
  // GOOGLE IDENTITY INITIALIZATION
  // =========================================================

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return undefined;
    }


    let isCancelled =
      false;


    const renderGoogleButton =
      () => {
        if (
          isCancelled ||
          !buttonContainerRef.current ||
          !window.google?.accounts?.id
        ) {
          return;
        }


        // -----------------------------------------------------
        // Google recommends initializing the client once.
        //
        // The global callback forwards credentials to whichever
        // authentication page is currently mounted.
        // -----------------------------------------------------

        window
          .__palmistryTarotGoogleCredentialHandler =
          (response) => {
            if (
              response?.credential &&
              credentialHandlerRef.current
            ) {
              credentialHandlerRef.current(
                response.credential
              );
            }
          };


        if (
          window
            .__palmistryTarotGoogleClientId
          !== GOOGLE_CLIENT_ID
        ) {
          window.google.accounts.id.initialize({
            client_id:
              GOOGLE_CLIENT_ID,

            callback:
              (response) => {
                window
                  .__palmistryTarotGoogleCredentialHandler
                  ?.(
                    response
                  );
              },

            auto_select:
              false,

            cancel_on_tap_outside:
              true,
          });


          window
            .__palmistryTarotGoogleClientId =
            GOOGLE_CLIENT_ID;
        }


        buttonContainerRef
          .current
          .replaceChildren();


        window.google.accounts.id.renderButton(
          buttonContainerRef.current,
          {
            type:
              "standard",

            theme:
              "outline",

            size:
              "large",

            text:
              "continue_with",

            shape:
              "rectangular",

            logo_alignment:
              "left",

            width:
              360,
          }
        );
      };


    // ---------------------------------------------------------
    // SCRIPT ALREADY LOADED
    // ---------------------------------------------------------

    if (
      window.google?.accounts?.id
    ) {
      renderGoogleButton();

      return () => {
        isCancelled = true;
      };
    }


    // ---------------------------------------------------------
    // WAIT FOR GOOGLE SCRIPT
    // ---------------------------------------------------------

    const googleScript =
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );


    if (googleScript) {
      googleScript.addEventListener(
        "load",
        renderGoogleButton
      );
    }


    return () => {
      isCancelled = true;

      if (googleScript) {
        googleScript.removeEventListener(
          "load",
          renderGoogleButton
        );
      }
    };
  }, []);


  // =========================================================
  // GOOGLE NOT CONFIGURED
  // =========================================================

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }


  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className={
        disabled
          ? "google-auth-wrapper google-auth-disabled"
          : "google-auth-wrapper"
      }
    >
      <div
        ref={
          buttonContainerRef
        }
        className="google-auth-button"
      />

      {disabled && (
        <div
          className="google-auth-overlay"
          aria-hidden="true"
        />
      )}
    </div>
  );
}


export default GoogleSignInButton;