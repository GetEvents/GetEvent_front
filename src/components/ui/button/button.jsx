const Index = ({ type, label, className, onClick, disabled }) => {
  return (
    <input
      type={type}
      value={label}
      className={className}
      onClick={onClick}
      disabled={disabled}
    />
  );
};

export default Index;
