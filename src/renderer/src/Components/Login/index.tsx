import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";

import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";

import usePackageStore from "@renderer/store";

import { SIGN_IN_ALERT, COMMON_ALERT } from "../../constants/messages";
import googleLogo from "../../assets/images/googleLogo.svg";
import kakaoLogo from "../../assets/images/kakaoLogo.svg";
import { auth } from "@renderer/services/firebaseService/firebase";

function Login() {
  const navigate = useNavigate();
  const { setClientStatus } = usePackageStore();

  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const { openInfoModal, setInfoMessage } = usePackageStore();

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_KEY);
    }
  }, []);

  const notifyInfoMessage = useCallback(
    (message: string) => {
      setInfoMessage(message);
      openInfoModal();
    },
    [setInfoMessage, openInfoModal],
  );

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailValue,
        passwordValue,
      );
      const firebaseIdToken = await userCredential.user.getIdToken();

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/sign-in/email`,
        { firebaseIdToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseIdToken}`,
          },
        },
      );

      const { deliOrderToken, userId, loginType } = response.data;
      window.localStorage.setItem("deliOrderToken", deliOrderToken);
      window.localStorage.setItem("deliOrderUserId", userId);
      window.localStorage.setItem("deliOrderAuthProvider", loginType);

      setClientStatus({ isLogin: true });
      navigate("/");
    } catch (error) {
      console.error("이메일 로그인 실패: ", error);
      if (
        error instanceof AxiosError &&
        error.code === "auth/invalid-credential"
      ) {
        notifyInfoMessage(SIGN_IN_ALERT.CHECK_ID_OR_PASSWORD);
      } else if (
        error instanceof AxiosError &&
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        notifyInfoMessage(COMMON_ALERT.INVALID_REQUEST);
      } else {
        notifyInfoMessage(COMMON_ALERT.SERVER_ERROR_TRY_AGAIN);
      }
    }
  };

  useEffect(() => {
    window.api.onKakaoAuthCode((code: string) => {
      try {
        navigate(`/?code=${code}`);
      } catch (error) {
        console.error("카카오 로그인 실패:", error);
        notifyInfoMessage(COMMON_ALERT.SERVER_ERROR_TRY_AGAIN);
      }
    });
  }, [navigate, notifyInfoMessage]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const firebaseIdToken = await user.getIdToken();

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/auth/sign-in/google`,
        { firebaseIdToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseIdToken}`,
          },
        },
      );

      const { deliOrderToken, userId, loginType } = response.data;
      window.localStorage.setItem("deliOrderToken", deliOrderToken);
      window.localStorage.setItem("deliOrderUserId", userId);
      window.localStorage.setItem("deliOrderAuthProvider", loginType);

      setClientStatus({ isLogin: true });
      navigate("/");
    } catch (error) {
      console.error("구글 로그인 실패: ", error);
      if (
        error instanceof AxiosError &&
        error.code === "auth/invalid-credential"
      ) {
        notifyInfoMessage(SIGN_IN_ALERT.CHECK_ID_OR_PASSWORD);
      } else {
        notifyInfoMessage(COMMON_ALERT.SERVER_ERROR_TRY_AGAIN);
      }
    }
  };
  const handleKakaoLogin = async () => {
    try {
      await window.api.startKakaoLogin();
    } catch (error) {
      console.error("카카오 로그인 실패: ", error);
      notifyInfoMessage(COMMON_ALERT.SERVER_ERROR_TRY_AGAIN);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-light p-4">
      <form
        className="m-4 w-[400px] rounded border-gray-600 bg-white p-6 shadow-md"
        onSubmit={handleEmailLogin}
      >
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="user-mail"
          >
            이메일
          </label>
          <input
            className="h-12 w-full rounded border p-3 leading-tight text-gray-700 shadow focus:border-gray-700"
            id="user-mail"
            name="user-mail"
            type="email"
            onChange={(event) => setEmailValue(event.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="mb-2 block text-sm font-bold text-gray-700"
            htmlFor="password"
          >
            비밀번호
          </label>
          <input
            className="h-12 w-full rounded border p-3 leading-tight text-gray-700 shadow focus:border-gray-700"
            id="password"
            name="password"
            type="password"
            onChange={(event) => setPasswordValue(event.target.value)}
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            className="focus:shadow-outline mb-8 w-full rounded-md bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            type="submit"
          >
            이메일 로그인
          </button>
        </div>
        <div className="mb-8 border-b border-slate-300" />
        <div className="mb-4 flex flex-col items-center justify-around">
          <button
            className="focus:shadow-outline mb-4 flex w-full items-center justify-center rounded-md bg-slate-200 px-4 py-2 font-bold text-black hover:bg-slate-300"
            type="button"
            onClick={handleGoogleLogin}
          >
            <img src={googleLogo} alt="Google Icon" className="mr-2 h-6 w-6" />
            구글 로그인
          </button>
          <button
            className="focus:shadow-outline mb-4 flex w-full items-center justify-center rounded-md bg-yellow-400 px-4 py-2 font-bold text-black hover:bg-yellow-500"
            type="button"
            onClick={handleKakaoLogin}
          >
            <img src={kakaoLogo} alt="Kakao Icon" className="mr-2 h-6 w-6" />
            카카오 로그인
          </button>
        </div>
        <div className="text-center">
          <p className="mb-2 text-sm font-bold">DELIORDER가 처음이신가요?</p>
          <Link
            className="m-2 inline-block text-sm font-bold text-blue-500 hover:underline"
            to="/signUp"
          >
            이메일로 가입하기
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
