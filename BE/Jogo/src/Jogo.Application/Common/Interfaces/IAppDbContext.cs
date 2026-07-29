using Microsoft.EntityFrameworkCore;

namespace MechanicShop.Application.Common.Interfaces;

public interface IAppDbContext
{
    //TODO: Add DbSets for your entities

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
