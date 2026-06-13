"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

type FlashMessageProps = {
  success?: string;
  error?: string;
};

export function FlashMessage({ success, error }: FlashMessageProps) {
  useEffect(() => {
    const message = error || success;

    if (!message) {
      return;
    }

    void Swal.fire({
      icon: error ? "error" : "success",
      title: error ? "Gagal" : "Berhasil",
      text: message,
      confirmButtonText: "OK",
      confirmButtonColor: error ? "#bf3d4a" : "#087f8c",
      background: "#ffffff",
      color: "#17202a"
    });

    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    url.searchParams.delete("error");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [success, error]);

  return null;
}
