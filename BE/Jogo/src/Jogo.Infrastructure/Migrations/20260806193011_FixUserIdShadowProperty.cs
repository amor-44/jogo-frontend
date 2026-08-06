using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jogo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixUserIdShadowProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ScoutProfiles_UserId",
                table: "ScoutProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerProfiles_UserId",
                table: "PlayerProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContactRequests_PlayerProfileId",
                table: "ContactRequests",
                column: "PlayerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactRequests_ScoutProfileId",
                table: "ContactRequests",
                column: "ScoutProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_AnalysisReports_VideoId",
                table: "AnalysisReports",
                column: "VideoId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AnalysisReports_FootballVideos_VideoId",
                table: "AnalysisReports",
                column: "VideoId",
                principalTable: "FootballVideos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ContactRequests_PlayerProfiles_PlayerProfileId",
                table: "ContactRequests",
                column: "PlayerProfileId",
                principalTable: "PlayerProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ContactRequests_ScoutProfiles_ScoutProfileId",
                table: "ContactRequests",
                column: "ScoutProfileId",
                principalTable: "ScoutProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PlayerProfiles_Users_UserId",
                table: "PlayerProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ScoutProfiles_Users_UserId",
                table: "ScoutProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AnalysisReports_FootballVideos_VideoId",
                table: "AnalysisReports");

            migrationBuilder.DropForeignKey(
                name: "FK_ContactRequests_PlayerProfiles_PlayerProfileId",
                table: "ContactRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_ContactRequests_ScoutProfiles_ScoutProfileId",
                table: "ContactRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_PlayerProfiles_Users_UserId",
                table: "PlayerProfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_ScoutProfiles_Users_UserId",
                table: "ScoutProfiles");

            migrationBuilder.DropIndex(
                name: "IX_ScoutProfiles_UserId",
                table: "ScoutProfiles");

            migrationBuilder.DropIndex(
                name: "IX_PlayerProfiles_UserId",
                table: "PlayerProfiles");

            migrationBuilder.DropIndex(
                name: "IX_ContactRequests_PlayerProfileId",
                table: "ContactRequests");

            migrationBuilder.DropIndex(
                name: "IX_ContactRequests_ScoutProfileId",
                table: "ContactRequests");

            migrationBuilder.DropIndex(
                name: "IX_AnalysisReports_VideoId",
                table: "AnalysisReports");
        }
    }
}
