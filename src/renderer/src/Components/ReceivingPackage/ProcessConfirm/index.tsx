import { ReactNode, useState } from "react";

import Modal from "../../Modal";

import usePackageStore, { OrderType } from "@renderer/store";
import useModal from "@renderer/hooks/useModal";
import { GUIDE_MESSAGES, COMMON_ALERT } from "@renderer/constants/messages";
import { AxiosError } from "axios";

interface ProcessConfirmProps {
  orders: Array<OrderType>;
  closeModal: () => void;
}

function ProcessConfirm({
  orders,
  closeModal,
}: ProcessConfirmProps): ReactNode {
  const [processResults, setProcessResults] = useState<Array<string>>([]);
  const [isResultModalOpen, openResultModal, closeResultModal] = useModal();
  const { setInfoMessage, openInfoModal } = usePackageStore();

  const startIndex = 0;
  const endIndex = orders.length - 1;

  const startPath = orders[startIndex].executionPath;
  const endPath = orders[endIndex].executionPath;

  const overview = orders.map((order: OrderType, index: number) => {
    const indexNumber = index + 1;

    if (order.action === "수정하기") {
      return `${indexNumber}. ${order.attachmentName} 을(를) ${order.editingName}로 ${order.action}`;
    } else {
      return `${indexNumber}. ${order.attachmentName} 을(를) ${order.useVscode ? "vscode 로" : ""} ${order.action}`;
    }
  });

  const handleProcessPackage = async (
    receivedPackage: Array<OrderType>,
  ): Promise<void> => {
    try {
      const results: Array<string> = [];

      for (const order of receivedPackage) {
        let result;
        switch (order.action) {
          case "생성하기":
            result = await window.api.downloadFile(order);
            break;
          case "이동하기":
            result = await window.api.moveFile(order);
            break;
          case "복제하기":
            result = await window.api.replicateFile(order);
            break;
          case "수정하기":
            result = await window.api.editFileName(order);
            break;
          case "실행하기":
            result = await window.api.executeFile(order);
            break;
          case "삭제하기":
            result = await window.api.deleteFile(order);
            break;
          case "압축해제하기":
            result = await window.api.unzipFile(order);
            break;
          default:
            result = "알 수 없는 작업입니다";
        }
        results.push(result);
      }

      setProcessResults(results);
      openResultModal();
    } catch (error) {
      if (error instanceof AxiosError) {
        setInfoMessage(
          error.response
            ? error.response.data.message
            : COMMON_ALERT.ERROR_OCCUR,
        );
        openInfoModal();
      }
    }
  };

  return (
    <>
      <div className="grid justify-items-start">
        <p className="mt-1 text-xs">시작경로 : {startPath}</p>
        <p className="mt-1 text-xs">종료경로 : {endPath}</p>
        <p className="mt-3 text-xs">진행내용 : </p>
        {overview.map((order) => (
          <p key={order} className="mt-2 text-xs">
            {order}
          </p>
        ))}
        <p className="mt-5 justify-self-center text-sm font-bold text-red-400">
          {GUIDE_MESSAGES.CONFIRMATION}
        </p>
      </div>
      <div className="mt-1 flex justify-center">
        <button
          type="button"
          onClick={() => handleProcessPackage(orders)}
          className="button-yellow-square w-24"
        >
          확인
        </button>
      </div>
      <Modal
        title="실행결과"
        isOpen={isResultModalOpen}
        onClose={() => {
          closeResultModal();
          closeModal();
        }}
      >
        {processResults.map((result, index) => (
          <p key={index} className="mt-2 text-xs">
            {result}
          </p>
        ))}
      </Modal>
    </>
  );
}

export default ProcessConfirm;
