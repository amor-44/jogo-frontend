using System;
using System.Collections.Generic;

public abstract class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public AccountStatus AccountStatus { get; set; }
}
