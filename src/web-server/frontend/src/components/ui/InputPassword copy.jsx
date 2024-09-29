const InputPassword = ({ id, label, ...rest}) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-normal text-gray-800">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type="password"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-600 sm:text-sm"
                autoComplete="off"
                {...rest} // Spread the rest of the input props
            />
        </div>
    );
};

export default InputPassword;
