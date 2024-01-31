import { PaperPlaneTilt } from "@phosphor-icons/react";

 function InputBox({ inputValue, setInputValue, sendMessage }) {

    return (
        <div className="flex items-center py-3 input-box">
            <input
                type="text"
                className="flex-1 p-2 border rounded-l-md input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
           
            <button onClick={sendMessage} className="bg-orange-600 text-dark p-2 rounded-r-md hover:bg-orange-400">
                <PaperPlaneTilt size={25} />
            </button>
        </div>
    );
}

export default InputBox