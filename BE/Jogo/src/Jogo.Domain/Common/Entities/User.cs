using Microsoft.AspNetCore.Identity;

public abstract class User : IdentityUser<Guid>
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public byte[] RowVersion { get; set; } = [];
    public AccountStatus AccountStatus { get; set; }
}
