import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password/send-otp", {
        mobile,
      });
      setSuccess(response.data.message || "OTP sent successfully!");
      setTimeout(() => {
        setStep(2);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password/reset", {
        mobile,
        otp,
        newPassword,
      });
      setSuccess(
        response.data.message || "Password reset successfully! Redirecting...",
      );
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cocoa-50 to-sand-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
      >
        <button
          onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] text-cocoa-900 transition active:scale-90 mb-6"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="font-display text-3xl font-black text-cocoa-900 tracking-tight mb-2">
          Reset Password
        </h1>
        <p className="text-sm font-medium text-cocoa-900/60 mb-8">
          {step === 1
            ? "Enter your mobile number to receive an OTP"
            : "Enter the OTP and your new password"}
        </p>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-cocoa-900/60 mb-2 uppercase tracking-wide">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  required
                  maxLength="10"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setMobile(value);
                  }}
                  className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] font-bold text-rose-500 text-center"
                  >
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] font-bold text-green-600 text-center"
                  >
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full rounded-[1rem] bg-[#1A1A1A] py-3.5 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-cocoa-900/60 mb-2 uppercase tracking-wide">
                  OTP Code
                </label>
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setOtp(value);
                  }}
                  className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-900/60 mb-2 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (min. 6 chars)"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-[1rem] bg-[#F5F5F5] px-4 py-3.5 pr-12 text-sm font-semibold text-cocoa-900 outline-none focus:ring-2 focus:ring-cocoa-900/10 transition-all placeholder:text-cocoa-900/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cocoa-900/40 hover:text-cocoa-900 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] font-bold text-rose-500 text-center"
                  >
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] font-bold text-green-600 text-center"
                  >
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-[1rem] bg-[#1A1A1A] py-3.5 text-sm font-black text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
