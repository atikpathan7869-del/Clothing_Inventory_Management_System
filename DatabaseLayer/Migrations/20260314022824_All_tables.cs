using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DatabaseLayer.Migrations
{
    /// <inheritdoc />
    public partial class All_tables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tbl_Admin",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Full_Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Contact_No = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Admin", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Brand",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Brand", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Category",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Descriptions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Category", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Financial_Year",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    isDelete = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdateAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Financial_Year", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_StaffMaster",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DOJ = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_StaffMaster", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Vendor",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactPerson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GSTIN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BankAccountName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IFSC = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountHolderName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Vendor", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tbl_products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BrandId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Size = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Fabric = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StockQuantity = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_products_tbl_Brand_BrandId",
                        column: x => x.BrandId,
                        principalTable: "tbl_Brand",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_products_tbl_Category_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "tbl_Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Outwords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactDetails = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StaffMasterId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Outwords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Outwords_tbl_StaffMaster_StaffMasterId",
                        column: x => x.StaffMasterId,
                        principalTable: "tbl_StaffMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ReciptMaster",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReciptNo = table.Column<int>(type: "int", nullable: false),
                    BillDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinancialYearId = table.Column<int>(type: "int", nullable: false),
                    StaffMasterId = table.Column<int>(type: "int", nullable: false),
                    GrossAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ReciptMaster", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ReciptMaster_tbl_Financial_Year_FinancialYearId",
                        column: x => x.FinancialYearId,
                        principalTable: "tbl_Financial_Year",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_ReciptMaster_tbl_StaffMaster_StaffMasterId",
                        column: x => x.StaffMasterId,
                        principalTable: "tbl_StaffMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_PaymentMaster",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinancialYearId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_PaymentMaster", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_PaymentMaster_tbl_Financial_Year_FinancialYearId",
                        column: x => x.FinancialYearId,
                        principalTable: "tbl_Financial_Year",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_PaymentMaster_tbl_Vendor_VendorId",
                        column: x => x.VendorId,
                        principalTable: "tbl_Vendor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Purchase",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VendorId = table.Column<int>(type: "int", nullable: false),
                    PurchaseName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EWayBillNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BillNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BillDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GSTType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GrossAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    FinancialYearId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Purchase", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_Purchase_tbl_Financial_Year_FinancialYearId",
                        column: x => x.FinancialYearId,
                        principalTable: "tbl_Financial_Year",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_Purchase_tbl_Vendor_VendorId",
                        column: x => x.VendorId,
                        principalTable: "tbl_Vendor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_Outword_Item",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OutwordId = table.Column<int>(type: "int", nullable: false),
                    StaffMasterId = table.Column<int>(type: "int", nullable: false),
                    Qty = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_Outword_Item", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_Outword_Item_Outwords_OutwordId",
                        column: x => x.OutwordId,
                        principalTable: "Outwords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_Outword_Item_tbl_StaffMaster_StaffMasterId",
                        column: x => x.StaffMasterId,
                        principalTable: "tbl_StaffMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ReciptPayment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReciptMasterId = table.Column<int>(type: "int", nullable: false),
                    FinancialYearId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ReciptPayment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ReciptPayment_tbl_Financial_Year_FinancialYearId",
                        column: x => x.FinancialYearId,
                        principalTable: "tbl_Financial_Year",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_ReciptPayment_tbl_ReciptMaster_ReciptMasterId",
                        column: x => x.ReciptMasterId,
                        principalTable: "tbl_ReciptMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalesReturn",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReciptMasterId = table.Column<int>(type: "int", nullable: false),
                    StaffMasterId = table.Column<int>(type: "int", nullable: false),
                    ReturnDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReturnType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GrossAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalesReturn", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_SalesReturn_tbl_ReciptMaster_ReciptMasterId",
                        column: x => x.ReciptMasterId,
                        principalTable: "tbl_ReciptMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_SalesReturn_tbl_StaffMaster_StaffMasterId",
                        column: x => x.StaffMasterId,
                        principalTable: "tbl_StaffMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_PurchaseDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    PurchaseId = table.Column<int>(type: "int", nullable: false),
                    Qty = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CostPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Size = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GrossAmt = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GstPer = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GstAmt = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_PurchaseDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_PurchaseDetails_tbl_Purchase_PurchaseId",
                        column: x => x.PurchaseId,
                        principalTable: "tbl_Purchase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_PurchaseDetails_tbl_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "tbl_products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_PurchasePayment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentMasterId = table.Column<int>(type: "int", nullable: false),
                    PurchaseId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_PurchasePayment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_PurchasePayment_tbl_PaymentMaster_PaymentMasterId",
                        column: x => x.PaymentMasterId,
                        principalTable: "tbl_PaymentMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_PurchasePayment_tbl_Purchase_PurchaseId",
                        column: x => x.PurchaseId,
                        principalTable: "tbl_Purchase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_CreditNote",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesReturnId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_CreditNote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_CreditNote_tbl_SalesReturn_SalesReturnId",
                        column: x => x.SalesReturnId,
                        principalTable: "tbl_SalesReturn",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ReturnPayment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesReturnId = table.Column<int>(type: "int", nullable: false),
                    PaymentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaidDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ReturnPayment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ReturnPayment_tbl_SalesReturn_SalesReturnId",
                        column: x => x.SalesReturnId,
                        principalTable: "tbl_SalesReturn",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_SalesReturn_Item",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalesReturnId = table.Column<int>(type: "int", nullable: false),
                    ReciptMasterId = table.Column<int>(type: "int", nullable: false),
                    Qty = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_SalesReturn_Item", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_SalesReturn_Item_tbl_ReciptMaster_ReciptMasterId",
                        column: x => x.ReciptMasterId,
                        principalTable: "tbl_ReciptMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_SalesReturn_Item_tbl_SalesReturn_SalesReturnId",
                        column: x => x.SalesReturnId,
                        principalTable: "tbl_SalesReturn",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_StockMaster",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PurchaseDetailsId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    StaffMasterId = table.Column<int>(type: "int", nullable: false),
                    Size = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Qty = table.Column<int>(type: "int", nullable: false),
                    RateGST = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SalePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CostPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InwardDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StockCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Barcode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_StockMaster", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_StockMaster_tbl_PurchaseDetails_PurchaseDetailsId",
                        column: x => x.PurchaseDetailsId,
                        principalTable: "tbl_PurchaseDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_StockMaster_tbl_StaffMaster_StaffMasterId",
                        column: x => x.StaffMasterId,
                        principalTable: "tbl_StaffMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_StockMaster_tbl_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "tbl_products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tbl_ReciptItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StockMasterId = table.Column<int>(type: "int", nullable: false),
                    ReciptMasterId = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Qty = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountPer = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTPer = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GSTAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbl_ReciptItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tbl_ReciptItem_tbl_ReciptMaster_ReciptMasterId",
                        column: x => x.ReciptMasterId,
                        principalTable: "tbl_ReciptMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tbl_ReciptItem_tbl_StockMaster_StockMasterId",
                        column: x => x.StockMasterId,
                        principalTable: "tbl_StockMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Outwords_StaffMasterId",
                table: "Outwords",
                column: "StaffMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_CreditNote_SalesReturnId",
                table: "tbl_CreditNote",
                column: "SalesReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Outword_Item_OutwordId",
                table: "tbl_Outword_Item",
                column: "OutwordId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Outword_Item_StaffMasterId",
                table: "tbl_Outword_Item",
                column: "StaffMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_PaymentMaster_FinancialYearId",
                table: "tbl_PaymentMaster",
                column: "FinancialYearId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_PaymentMaster_VendorId",
                table: "tbl_PaymentMaster",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_products_BrandId",
                table: "tbl_products",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_products_CategoryId",
                table: "tbl_products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Purchase_FinancialYearId",
                table: "tbl_Purchase",
                column: "FinancialYearId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_Purchase_VendorId",
                table: "tbl_Purchase",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_PurchaseDetails_ProductId",
                table: "tbl_PurchaseDetails",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_PurchaseDetails_PurchaseId",
                table: "tbl_PurchaseDetails",
                column: "PurchaseId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_PurchasePayment_PaymentMasterId",
                table: "tbl_PurchasePayment",
                column: "PaymentMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_PurchasePayment_PurchaseId",
                table: "tbl_PurchasePayment",
                column: "PurchaseId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReciptItem_ReciptMasterId",
                table: "tbl_ReciptItem",
                column: "ReciptMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReciptItem_StockMasterId",
                table: "tbl_ReciptItem",
                column: "StockMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReciptMaster_FinancialYearId",
                table: "tbl_ReciptMaster",
                column: "FinancialYearId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReciptMaster_StaffMasterId",
                table: "tbl_ReciptMaster",
                column: "StaffMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReciptPayment_FinancialYearId",
                table: "tbl_ReciptPayment",
                column: "FinancialYearId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReciptPayment_ReciptMasterId",
                table: "tbl_ReciptPayment",
                column: "ReciptMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_ReturnPayment_SalesReturnId",
                table: "tbl_ReturnPayment",
                column: "SalesReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalesReturn_ReciptMasterId",
                table: "tbl_SalesReturn",
                column: "ReciptMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalesReturn_StaffMasterId",
                table: "tbl_SalesReturn",
                column: "StaffMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalesReturn_Item_ReciptMasterId",
                table: "tbl_SalesReturn_Item",
                column: "ReciptMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_SalesReturn_Item_SalesReturnId",
                table: "tbl_SalesReturn_Item",
                column: "SalesReturnId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_StockMaster_ProductId",
                table: "tbl_StockMaster",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_StockMaster_PurchaseDetailsId",
                table: "tbl_StockMaster",
                column: "PurchaseDetailsId");

            migrationBuilder.CreateIndex(
                name: "IX_tbl_StockMaster_StaffMasterId",
                table: "tbl_StockMaster",
                column: "StaffMasterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tbl_Admin");

            migrationBuilder.DropTable(
                name: "tbl_CreditNote");

            migrationBuilder.DropTable(
                name: "tbl_Outword_Item");

            migrationBuilder.DropTable(
                name: "tbl_PurchasePayment");

            migrationBuilder.DropTable(
                name: "tbl_ReciptItem");

            migrationBuilder.DropTable(
                name: "tbl_ReciptPayment");

            migrationBuilder.DropTable(
                name: "tbl_ReturnPayment");

            migrationBuilder.DropTable(
                name: "tbl_SalesReturn_Item");

            migrationBuilder.DropTable(
                name: "Outwords");

            migrationBuilder.DropTable(
                name: "tbl_PaymentMaster");

            migrationBuilder.DropTable(
                name: "tbl_StockMaster");

            migrationBuilder.DropTable(
                name: "tbl_SalesReturn");

            migrationBuilder.DropTable(
                name: "tbl_PurchaseDetails");

            migrationBuilder.DropTable(
                name: "tbl_ReciptMaster");

            migrationBuilder.DropTable(
                name: "tbl_Purchase");

            migrationBuilder.DropTable(
                name: "tbl_products");

            migrationBuilder.DropTable(
                name: "tbl_StaffMaster");

            migrationBuilder.DropTable(
                name: "tbl_Financial_Year");

            migrationBuilder.DropTable(
                name: "tbl_Vendor");

            migrationBuilder.DropTable(
                name: "tbl_Brand");

            migrationBuilder.DropTable(
                name: "tbl_Category");
        }
    }
}
