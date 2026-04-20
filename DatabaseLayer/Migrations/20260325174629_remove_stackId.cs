using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseLayer.Migrations
{
    /// <inheritdoc />
    public partial class remove_stackId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tbl_SalesReturn_Item_tbl_StockMaster_StockMasterId",
                table: "tbl_SalesReturn_Item");

            migrationBuilder.AlterColumn<int>(
                name: "StockMasterId",
                table: "tbl_SalesReturn_Item",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_SalesReturn_Item_tbl_StockMaster_StockMasterId",
                table: "tbl_SalesReturn_Item",
                column: "StockMasterId",
                principalTable: "tbl_StockMaster",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tbl_SalesReturn_Item_tbl_StockMaster_StockMasterId",
                table: "tbl_SalesReturn_Item");

            migrationBuilder.AlterColumn<int>(
                name: "StockMasterId",
                table: "tbl_SalesReturn_Item",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_SalesReturn_Item_tbl_StockMaster_StockMasterId",
                table: "tbl_SalesReturn_Item",
                column: "StockMasterId",
                principalTable: "tbl_StockMaster",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
