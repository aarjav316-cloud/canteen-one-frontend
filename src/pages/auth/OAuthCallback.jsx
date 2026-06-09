import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      processed.current = true;
      navigate("/", {
        replace: true,
        state: { error: "Authentication failed" },
      });
      return;
    }

    if (token) {
      processed.current = true;
      login(token);
      navigate("/student", { replace: true });
    } else if (searchParams.has("error") || searchParams.has("token") === false) {
      // If we landed here without token/error or after check
       navigate("/", { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
