interface AvatarProps {
  name?: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar = ({ name = 'User', image, size = 'md' }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-extrabold',
    lg: 'w-20 h-20 text-2xl font-black',
  };

  const firstLetter = name.trim().charAt(0).toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-blue-100 text-blue-700 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0 select-none`}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;