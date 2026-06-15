export const Card = ({ children, className = "", noPadding = false }) => {
  return (
    <article 
      className={`relative w-full h-fit flex flex-col items-start bg-white rounded-lg border border-solid border-[#e9e7e9] shadow-[0px_1px_3px_#0000000d] ${
        noPadding ? "" : "p-4"
      } ${className}`}
    >
      {children}
    </article>
  );
};

export const CardHeader = ({ title, action, className = "" }) => {
  return (
    <div className={`flex items-center justify-between p-4 flex-[0_0_auto] border-b border-solid border-[#e9e7e9] relative self-stretch w-full ${className}`}>
      <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
        <h3 className="relative flex items-center w-fit mt-[-1.00px] font-semibold text-[#041627] text-xl tracking-[0] leading-7">
          {title}
        </h3>
      </div>
      {action && (
        <div className="inline-flex items-start relative flex-[0_0_auto]">
          {action}
        </div>
      )}
    </div>
  );
};

export const CardBody = ({ children, className = "" }) => {
  return (
    <div className={`flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] ${className}`}>
      {children}
    </div>
  );
};
