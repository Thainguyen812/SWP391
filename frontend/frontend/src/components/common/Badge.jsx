export const Badge = ({ children, type = "default", className = "" }) => {
  // Define styles based on type
  const typeStyles = {
    default: "bg-[#efedef] text-[#44474c]",
    danger: "bg-[#ffdad6] text-[#93000a]",
    success: "bg-[#4edea333] text-[#00311f]",
    primary: "bg-[#d2e4fb] text-[#0058be]"
  };

  const selectedStyle = typeStyles[type] || typeStyles.default;

  return (
    <div className={`inline-flex flex-col items-start px-2 py-1 relative self-stretch flex-[0_0_auto] rounded-sm ${selectedStyle} ${className}`}>
      <div className="relative flex items-center w-fit mt-[-1.00px] font-normal text-[10px] tracking-[0] leading-[15px] whitespace-nowrap">
        {children}
      </div>
    </div>
  );
};
