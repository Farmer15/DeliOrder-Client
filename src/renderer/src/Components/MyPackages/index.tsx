import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import triangleArrowDown from "@images/triangleArrowDown.svg";
import axios, { AxiosError } from "axios";
import refreshToken from "@renderer/services/utils/refreshToken";
import { ExtendedOrderType } from "../CreatingPackage/CreatingOrder/BookmarkToolbar";

interface histroyDataTypes {
  author: string;
  createdAt: Date;
  expireAt: Date;
  orders: Array<ExtendedOrderType>;
  serialNumber: string;
  updatedAt: Date;
  validUntil: Date;
  __v: number;
  _id: string;
}

function MyPackages() {
  const [userHistoryData, setUserHistoryData] = useState<
    Array<histroyDataTypes>
  >([]);
  const [currentSort, setCurrentSort] = useState("sortByNewest");
  const navigate = useNavigate();

  useEffect(() => {
    const getUserHistoryData = async () => {
      const userId = window.localStorage.getItem("deliOrderUserId");
      const deliOrderToken = window.localStorage.getItem("deliOrderToken");
      const authorization = "Bearer " + deliOrderToken;

      try {
        const {
          data: { history },
        } = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/users/${userId}/history`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(deliOrderToken && { authorization }),
            },
          },
        );

        setUserHistoryData(
          history.sort(
            (a: ExtendedOrderType, b: ExtendedOrderType) =>
              Date.parse(String(b.createdAt)) - Date.parse(String(a.createdAt)),
          ),
        );
      } catch (error) {
        if (
          error instanceof AxiosError &&
          error.response?.data.error === "Unauthorized"
        ) {
          alert("로그인이 필요합니다.");
          navigate("/login");
        }

        if (
          error instanceof AxiosError &&
          error.response?.data.error === "Token expired"
        ) {
          try {
            const deliOrderUserId =
              window.localStorage.getItem("deliOrderUserId");

            if (!deliOrderUserId) {
              throw "로컬스토리지에 유저Id가 없습니다.";
            }

            await refreshToken(deliOrderUserId);
            getUserHistoryData();
          } catch (error) {
            console.error("토큰 갱신중에 오류가 발생하였습니다.", error);
          }
        }
        console.error("유저정보를 불러오는 중 오류가 발생하였습니다.", error);
      }
    };

    getUserHistoryData();
  }, [navigate]);

  const toggleSort = () => {
    let sortedUserHistory;

    if (currentSort === "sortByNewest") {
      setCurrentSort("sortByOldest");

      sortedUserHistory = userHistoryData.sort(
        (a, b) =>
          Date.parse(String(a.createdAt)) - Date.parse(String(b.createdAt)),
      );
    } else {
      setCurrentSort("sortByNewest");

      sortedUserHistory = userHistoryData.sort(
        (a, b) =>
          Date.parse(String(b.createdAt)) - Date.parse(String(a.createdAt)),
      );
    }

    setUserHistoryData(sortedUserHistory);
  };

  return (
    <div className="flex min-h-screen items-start justify-center p-8">
      <div className="mt-6 w-full max-w-5xl space-y-8">
        <div
          className="flex cursor-pointer flex-row items-center text-lg font-bold text-blue-700 hover:text-blue-900"
          onClick={toggleSort}
        >
          <img
            className={`mr-2 h-5 w-5 ${
              currentSort === "sortByNewest" ? "" : "rotate-180"
            }`}
            src={triangleArrowDown}
            alt="Sort Icon"
          />
          {currentSort === "sortByNewest"
            ? "최신 패키지 순 정렬"
            : "과거 패키지 순 정렬"}
        </div>
        {userHistoryData.map((userPackage, index) => (
          <div
            key={userPackage.serialNumber}
            className="bg- rounded-xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <span className="text-xl font-semibold text-blue-800">
                패키지 {index + 1}
              </span>
              <time className="text-right text-sm text-gray-600">
                <p>
                  만료일시:{" "}
                  {new Date(userPackage.validUntil).toLocaleString()}{" "}
                </p>
                <span
                  className={`text-right font-bold ${
                    Date.parse(String(userPackage.validUntil)) >
                    Date.parse(String(new Date()))
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Date.parse(String(userPackage.validUntil)) >
                  Date.parse(String(new Date()))
                    ? "전송 가능"
                    : "만료됨"}
                </span>
              </time>
            </div>
            <div className="space-y-4">
              {userPackage.orders.map((order, orderIndex) => (
                <div key={order._id} className="text-gray-700">
                  <span className="button-green-bright font-bold text-black">
                    {orderIndex + 1}
                  </span>
                  <span className="text-gray-600">
                    {` "${order.attachmentName}" 을(를) `}
                  </span>
                  {order.sourcePath && (
                    <span className="text-gray-600">
                      {order.sourcePath}에서{" "}
                    </span>
                  )}
                  <span className="text-gray-600">
                    {" "}
                    {order.executionPath}
                    {order.action === "이동하기" ? "(으)로 " : "에서 "}
                  </span>
                  {order.editingName && (
                    <span className="text-gray-600">
                      {`"${order.editingName}"(으)로 `}
                    </span>
                  )}
                  <span className="font-bold text-blue-700">
                    {` ${order.action}`}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col justify-between text-left">
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-bold">링크: </span>
                <span
                  className="cursor-pointer hover:font-bold"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `electron-deliorder://open?packageId=${userPackage.serialNumber}`,
                    );
                  }}
                >
                  {`electron-deliorder://open?packageId=${userPackage.serialNumber}`}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-bold">일련번호: </span>
                <span
                  className="cursor-pointer hover:font-bold"
                  onClick={() =>
                    navigator.clipboard.writeText(userPackage.serialNumber)
                  }
                >
                  {userPackage.serialNumber}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyPackages;
