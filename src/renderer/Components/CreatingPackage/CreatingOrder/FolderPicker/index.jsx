import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import usePackageStore from "@renderer/store";

function FolderPicker({ isOptional }) {
  const [filePath, setFilePath] = useState("");
  const { updateOrder, getOrder, setClientStatus, clientStatus } =
    usePackageStore();
  const currentOrder = getOrder();

  const pathType = isOptional ? "sourcePath" : "executionPath";
  const description = isOptional ? "출발" : "목적";

  useEffect(() => {
    if (clientStatus.isSubmitted) {
      setFilePath("");
      setClientStatus({ isSubmitted: false });
    }
  }, [clientStatus.isSubmitted]);

  const openFolderPicker = async () => {
    try {
      const { canceled, filePaths } = await window.electronAPI.openFileDialog();

      if (canceled) {
        console.error("폴더 선택이 취소되었습니다.");
      }

      if (filePaths.length === 0) {
        console.error("선택된 경로가 없습니다.");
      }

      const selectedPath = filePaths;

      setFilePath(selectedPath);

      updateOrder({ [pathType]: selectedPath });
    } catch (error) {
      console.error("폴더 경로를 여는 중 에러가 발생 :", error);
    }
  };

  const appendUserPath = (event) => {
    const userDefinedPath = event.target.value;
    updateOrder({ [pathType]: filePath + userDefinedPath });
  };

  const displayedPath = currentOrder[pathType] || filePath;

  return (
    <div className="my-3">
      <label className="label-small">{description}경로 선택하기</label>
      <button
        type="button"
        className="input-base focus:shadow-outline"
        onClick={openFolderPicker}
      >
        경로를 선택해 주세요.
      </button>
      <input
        type="text"
        className="input-text focus:shadow-outline"
        placeholder="추가 경로 입력하기"
        onChange={appendUserPath}
      />
      <p className="text-base-gray">
        {pathType} : {displayedPath}
      </p>
    </div>
  );
}

FolderPicker.propTypes = {
  isOptional: PropTypes.bool.isRequired,
};

export default FolderPicker;
