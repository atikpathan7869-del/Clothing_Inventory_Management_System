using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseLayer.Migrations
{
    /// <inheritdoc />
    public partial class outworditem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StockMasterId",
                table: "tbl_Outword_Item",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Outword_Item_StockMasterId",
                table: "tbl_Outword_Item",
                column: "StockMasterId");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_Outword_Item_tbl_StockMaster_StockMasterId",
                table: "tbl_Outword_Item",
                column: "StockMasterId",
                principalTable: "tbl_StockMaster",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tbl_Outword_Item_tbl_StockMaster_StockMasterId",
                table: "tbl_Outword_Item");

            migrationBuilder.DropIndex(
                name: "IX_tbl_Outword_Item_StockMasterId",
                table: "tbl_Outword_Item");

            migrationBuilder.DropColumn(
                name: "StockMasterId",
                table: "tbl_Outword_Item");
        }
    }
}
