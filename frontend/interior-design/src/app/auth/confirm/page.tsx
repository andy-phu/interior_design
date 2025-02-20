"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (!token_hash || !type) {
        setStatus("error");
        return;
      }

      try {
        const response = await fetch(`/auth/confirm/api?token_hash=${token_hash}&type=${type}`);
        if (response.ok) {
          setStatus("success");
          setTimeout(() => router.push("/login"), 3000); // Redirect to login after 3s
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === "loading" && <p>Confirming your email...</p>}
      {status === "success" && <p>Email confirmed! Redirecting to login...</p>}
      {status === "error" && <p>Invalid or expired confirmation link.</p>}
    </div>
  );
}