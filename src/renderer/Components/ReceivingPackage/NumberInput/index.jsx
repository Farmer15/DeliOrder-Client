import { VALID_KEY } from "../../../constants/validKey";

function NumberInput() {
  const validateNumber = (event) => {
    const value = event.target.value;
    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(value);

    if (isKorean || !VALID_KEY.includes(value)) {
      event.target.value = "";
    }
  };

  const shiftFocusOnKeyDown = (event) => {
    if (event.target.value && event.code !== "Backspace") {
      event.target.nextSibling?.focus();
      return;
    }

    if (!event.target.value && event.code === "Backspace") {
      event.target.previousSibling?.focus();
    }
  };

  return (
    <input
      maxLength="1"
      className="mx-3 h-16 w-16 transform rounded-lg bg-gray-200 text-center text-5xl shadow-md transition duration-200 hover:scale-110 focus:outline-none"
      type="text"
      onKeyDown={(event) => {
        validateNumber(event);
        shiftFocusOnKeyDown(event);
      }}
      onChange={validateNumber}
    />
  );
}

export default NumberInput;
