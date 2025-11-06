import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials, setLoading } from "@/features/auth/authSlice";
import { API_BASE_URL } from "@/lib/constants";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      dispatch(setLoading(true));

      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        // Store token in localStorage for persistence
        localStorage.setItem("token", token);

        // Fetch the authenticated user's profile
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch user info");

        const data = await response.json(); // { user, token }

        // Dispatch to Redux: update auth slice
        dispatch(setCredentials({ user: data.user, token }));

        // Redirect after successful authentication
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("Auth success error:", error);
        navigate("/login", { replace: true });
      } finally {
        dispatch(setLoading(false));
      }
    };

    handleAuthSuccess();
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold text-gray-800">Logging you in...</h1>
      <p className="mt-2 text-gray-500">
        Please wait while we verify your account.
      </p>
    </div>
  );
};

export default AuthSuccess;
