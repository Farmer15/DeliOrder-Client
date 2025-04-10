import { ReactNode, useState } from "react";

import BookmarkToolbar from "./BookmarkToolbar";
import ActionPicker from "./ActionPicker";
import FilePicker from "./FilePicker";
import FolderPicker from "./FolderPicker";

import {
  VALIDATION_MESSAGES,
  CREATE_ORDER_ALERT,
  PLACEHOLDER,
} from "@renderer/constants/messages";
import usePackageStore, { OrderType } from "@renderer/store";

import "@renderer/shared/style.css";

function CreatingOrder(): ReactNode {
  const { updateOrder, getOrder, clearOrder, addOrder, orders } =
    usePackageStore();
  const currentOrder = getOrder();
  const [message, setMessage] = useState("");

  const clearMessage = (): void => {
    setMessage("");
  };

  const validate = (order: OrderType): string | void => {
    function hasExtension(fileName: string): boolean {
      return /\.[^/.]+$/.test(fileName);
    }

    if (!order.action) {
      return CREATE_ORDER_ALERT.UNDEFINED_ACTION;
    }

    if (!order.attachmentName) {
      return CREATE_ORDER_ALERT.UNDEFINED_ATTACHMENT;
    }

    if (!order.executionPath) {
      return CREATE_ORDER_ALERT.UNDEFINED_EXECUTION_PATH;
    }

    if (order.action === "이동하기" && !order.sourcePath) {
      return CREATE_ORDER_ALERT.UNDEFINED_SOURCE_PATH;
    }

    if (order.action === "수정하기") {
      if (!order.editingName) return CREATE_ORDER_ALERT.UNDEFINED_EDITING_NAME;

      if (!hasExtension(order.editingName))
        return CREATE_ORDER_ALERT.UNDEFINED_EXTENSION_NAME;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateOrder({ editingName: event.target.value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const MAXIMUM_ORDER_NUMBER = 5;
    const isOverMaxOrders = orders.length >= MAXIMUM_ORDER_NUMBER;

    if (isOverMaxOrders) {
      setMessage(VALIDATION_MESSAGES.MAX_ORDER_LIMIT);
      return;
    }

    const validateResult = validate(currentOrder);
    if (validateResult) {
      setMessage(validateResult);
      return;
    }

    addOrder(currentOrder);
    clearOrder();
  };

  return (
    <div className="container-small min-w-[520px]">
      <label className="label-large">행동 조합 하기</label>
      <form onSubmit={handleSubmit} onClick={clearMessage}>
        <ActionPicker />
        <div className="mx-auto max-w-md">
          <FilePicker />
          {currentOrder.action === "이동하기" && (
            <FolderPicker isOptional={true} />
          )}
          <FolderPicker isOptional={false} />
          {currentOrder.action === "수정하기" && (
            <div className="my-3">
              <label className="label-small">편집할 이름 지정하기</label>
              <input
                type="text"
                className="input-text focus:shadow-outline"
                placeholder={PLACEHOLDER.EDITING_NAME}
                onChange={handleInput}
                value={currentOrder.editingName}
                required
              />
            </div>
          )}
        </div>
        <p className="text-xs-red">{message} </p>
        <button className="button-base-blue">조합하기</button>
      </form>
      <BookmarkToolbar />
    </div>
  );
}

export default CreatingOrder;
