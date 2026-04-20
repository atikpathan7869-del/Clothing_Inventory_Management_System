using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseLayer.Migrations
{
    /// <inheritdoc />
    public partial class initsalesitem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReciptItemId",
                table: "tbl_SalesReturn_Item",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StockMasterId",
                table: "tbl_SalesReturn_Item",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalesReturn_Item_ReciptItemId",
                table: "tbl_SalesReturn_Item",
                column: "ReciptItemId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalesReturn_Item_StockMasterId",
                table: "tbl_SalesReturn_Item",
                column: "StockMasterId");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_SalesReturn_Item_tbl_ReciptItem_ReciptItemId",
                table: "tbl_SalesReturn_Item",
                column: "ReciptItemId",
                principalTable: "tbl_ReciptItem",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_SalesReturn_Item_tbl_StockMaster_StockMasterId",
                table: "tbl_SalesReturn_Item",
                column: "StockMasterId",
                principalTable: "tbl_StockMaster",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tbl_SalesReturn_Item_tbl_ReciptItem_ReciptItemId",
                table: "tbl_SalesReturn_Item");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_SalesReturn_Item_tbl_StockMaster_StockMasterId",
                table: "tbl_SalesReturn_Item");

            migrationBuilder.DropIndex(
                name: "IX_tbl_SalesReturn_Item_ReciptItemId",
                table: "tbl_SalesReturn_Item");

            migrationBuilder.DropIndex(
                name: "IX_tbl_SalesReturn_Item_StockMasterId",
                table: "tbl_SalesReturn_Item");

            migrationBuilder.DropColumn(
                name: "ReciptItemId",
                table: "tbl_SalesReturn_Item");

            migrationBuilder.DropColumn(
                name: "StockMasterId",
                table: "tbl_SalesReturn_Item");
        }
    }
}
