using System.Collections.Generic;
public class Organization : User
{
    public string OrganizationName { get; set; } = null!;
    public OrganizationType OrganizationType { get; set; }
    public string Location { get; set; } = null!;
    public string ContactInformation { get; set; } = null!;
    public ICollection<TokenTransaction> Transactions { get; set; } = new List<TokenTransaction>();
}
