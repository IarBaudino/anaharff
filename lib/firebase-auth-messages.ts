import { FirebaseError } from "firebase/app";

/** Mensaje para el usuario; evita filtrar si el email existe o no. */
export function passwordResetUserMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    if (err.code === "auth/invalid-email") {
      return "El email no tiene un formato válido.";
    }
    if (err.code === "auth/too-many-requests") {
      return "Demasiados intentos seguidos. Esperá unos minutos y probá de nuevo.";
    }
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      return "";
    }
  }
  return "No pudimos enviar el correo. Revisá el email o probá más tarde.";
}

export function shouldTreatPasswordResetAsSuccess(err: unknown): boolean {
  return err instanceof FirebaseError && err.code === "auth/user-not-found";
}
