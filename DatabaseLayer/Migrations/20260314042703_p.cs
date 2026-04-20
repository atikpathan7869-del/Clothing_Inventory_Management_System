using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseLayer.Migrations
{
    /// <inheritdoc />
    public partial class p : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tbl_StockMaster_tbl_PurchaseDetails_PurchaseDetailsId",
                table: "tbl_StockMaster");

            migrationBuilder.AlterColumn<int>(
                name: "PurchaseDetailsId",
                table: "tbl_StockMaster",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "PurchaseId",
                table: "tbl_StockMaster",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tbl_StockMaster_PurchaseId",
                table: "tbl_StockMaster",
                column: "PurchaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_StockMaster_tbl_PurchaseDetails_PurchaseDetailsId",
                table: "tbl_StockMaster",
                column: "PurchaseDetailsId",
                principalTable: "tbl_PurchaseDetails",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_StockMaster_tbl_Purchase_PurchaseId",
                table: "tbl_StockMaster",
                column: "PurchaseId",
                principalTable: "tbl_Purchase",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tbl_StockMaster_tbl_PurchaseDetails_PurchaseDetailsId",
                table: "tbl_StockMaster");

            migrationBuilder.DropForeignKey(
                name: "FK_tbl_StockMaster_tbl_Purchase_PurchaseId",
                table: "tbl_StockMaster");

            migrationBuilder.DropIndex(
                name: "IX_tbl_StockMaster_PurchaseId",
                table: "tbl_StockMaster");

            migrationBuilder.DropColumn(
                name: "PurchaseId",
                table: "tbl_StockMaster");

            migrationBuilder.AlterColumn<int>(
                name: "PurchaseDetailsId",
                table: "tbl_StockMaster",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_tbl_StockMaster_tbl_PurchaseDetails_PurchaseDetailsId",
                table: "tbl_StockMaster",
                column: "PurchaseDetailsId",
                principalTable: "tbl_PurchaseDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
