using System.Collections.Generic;
public class Player : User
{
    public DateTime DateOfBirth { get; set; }
    public string Position { get; set; } = null!;
    public string Location { get; set; } = null!;
    public string? CurrentTeam { get; set; }
    public string? FootballExperience { get; set; }
    public bool ProfileVisibility { get; set; }
   
    public ICollection<FootballVideo> Videos { get; set; } = new List<FootballVideo>();
    public ICollection<ContactUnlock> ContactUnlocks { get; set; } = new List<ContactUnlock>();
}
