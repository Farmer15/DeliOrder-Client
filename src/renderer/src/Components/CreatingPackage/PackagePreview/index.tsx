import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import Order from "./Order";
import Modal from "../../Modal";

import usePackageStore from "@renderer/store";
import useModal from "@renderer/hooks/useModal";
import refreshToken from "@renderer/services/utils/refreshToken";
import { PACKAGE_PREVIEW_ALERT } from "@renderer/constants/messages";

function PackagePreview() {
  const [isLoading, setIsLoading] = useState(false);
  const [expiredTime, setExpiredTime] = useState<Date | null>(null);
  const [serialNumber, setSerialNumber] = useState("");

  const [isOpen, openModal, closeModal] = useModal();
  const { orders, getOrders, clearOrders, setInfoMessage, openInfoModal } =
    usePackageStore();
  const orderPackage = getOrders();
  const navigate = useNavigate();

  const s3Client = new S3Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY_ID,
    },
  });

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const uploadFileToAWS = async () => {
    const ordersToCreate = orderPackage.filter(
      (order) => order.action === "생성하기",
    );

    if (!ordersToCreate.every((order) => order.attachmentType === "file")) {
      setIsLoading(false);
      setInfoMessage(PACKAGE_PREVIEW_ALERT.NO_FILE_TO_UPLOAD);
      openInfoModal();
      return;
    }

    try {
      await Promise.all(
        ordersToCreate.map(async (order) => {
          const uploadParams = {
            Bucket: import.meta.env.VITE_AWS_BUCKET,
            Key: order.attachmentName,
            Body: order.attachmentFile,
            ACL: ObjectCannedACL.public_read,
          };

          const uploadCommand = new PutObjectCommand(uploadParams);
          await s3Client.send(uploadCommand);

          const getCommand = new GetObjectCommand({
            Bucket: import.meta.env.VITE_AWS_BUCKET,
            Key: order.attachmentName,
          });

          const signedUrl = await getSignedUrl(s3Client, getCommand, {
            expiresIn: 1800,
          });

          order.attachmentUrl = signedUrl;
        }),
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("AWS에 업로드중 오류 발생:", error);
      }
    }
  };

  const deleteFileToAWS = async () => {
    try {
      const createOrders = orderPackage.filter(
        (order) => order.action === "생성하기",
      );

      if (!createOrders.every((action) => action.attachmentType === "file")) {
        setIsLoading(false);
        return;
      }

      await Promise.all(
        createOrders.map(async (file) => {
          const deleteParams = {
            Bucket: import.meta.env.VITE_AWS_BUCKET,
            Key: file.attachmentName,
          };

          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await s3Client.send(deleteCommand);
        }),
      );
    } catch (error) {
      console.error("AWS 파일 삭제중 오류 발생:", error);
    }
  };

  const uploadPackageToServer = async () => {
    try {
      const deliOrderToken = window.localStorage.getItem("deliOrderToken");
      const authorization = "Bearer " + deliOrderToken;

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/packages/new`,
        { orders: orderPackage },
        {
          headers: {
            "Content-Type": "application/json",
            ...(deliOrderToken && { authorization }),
          },
        },
      );
      setSerialNumber(response.data.serialNumber);
    } catch (error) {
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
          uploadPackageToServer();
        } catch (error) {
          console.error("토큰 갱신중에 오류가 발생하였습니다.", error);
        }
      }
      console.error("패키지 등록중 오류 발생: ", error);

      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.error);
      }
    }
  };

  const handleFilePackage = async () => {
    if (!orderPackage.length) {
      setInfoMessage(PACKAGE_PREVIEW_ALERT.EMPTY_PACKAGE);
      openInfoModal();
      return;
    }

    try {
      setIsLoading(true);
      await uploadFileToAWS();
      await uploadPackageToServer();

      const now = new Date();
      const tenMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

      setExpiredTime(tenMinutesLater);
      openModal();
    } catch (error) {
      deleteFileToAWS();

      if (error instanceof AxiosError) {
        console.error(
          "패키지 업로드 과정중 오류 발생: ",
          error.message || error,
        );
        setInfoMessage(
          error.message || PACKAGE_PREVIEW_ALERT.UPLOAD_FAIL_RETRY,
        );
      }

      openInfoModal();
    } finally {
      clearOrders();
      setIsLoading(false);
    }
  };

  const navigateToMainPage = () => {
    closeModal();
    navigate("/");
  };

  return (
    <div className="container-large flex-1">
      <label className="mb-2 block text-xl font-bold text-gray-700">
        패키지 미리보기
      </label>
      <div className="overflow-y-auto">
        {orders.map((order, index) => (
          <Order key={index} order={order} index={index} />
        ))}
      </div>
      <button
        className="absolute bottom-3 right-5 my-3 rounded bg-blue-500 px-6 py-3 text-xl font-bold text-white hover:bg-blue-700"
        onClick={handleFilePackage}
        disabled={isLoading}
      >
        패키징하기
      </button>
      <Modal title="DELIORDER" isOpen={isOpen} onClose={navigateToMainPage}>
        <div>
          <div className="mb-4">
            <p>일련번호</p>
            <div className="flex">
              <input
                type="text"
                defaultValue={serialNumber}
                className="flex-grow rounded-l-md border px-2 py-1"
                readOnly
              />
              <button
                className="rounded-r-md bg-blue-400 px-4 py-1 text-white hover:bg-blue-500"
                onClick={() => copyToClipboard(serialNumber)}
              >
                복사
              </button>
            </div>
          </div>
          <div className="mb-4">
            <p>링크주소</p>
            <div className="flex">
              <input
                type="text"
                defaultValue={`electron-deliorder://open?packageId=${serialNumber}`}
                className="flex-grow rounded-l-md border px-2 py-1"
                readOnly
              />
              <button
                className="rounded-r-md bg-blue-400 px-4 py-1 text-white hover:bg-blue-500"
                onClick={() =>
                  copyToClipboard(
                    `electron-deliorder://open?packageId=${serialNumber}`,
                  )
                }
              >
                복사
              </button>
            </div>
          </div>
          <p className="mt-4">
            이 일련번호와 링크주소는 30분 뒤(
            {expiredTime ? expiredTime.toLocaleTimeString().slice(0, -3) : ""}
            )까지 유효합니다
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default PackagePreview;
