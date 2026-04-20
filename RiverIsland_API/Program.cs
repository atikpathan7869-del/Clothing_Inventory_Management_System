using BusinessLayer.Interface;
using DatabaseLayer;
using DatabaseLayer.ApplicationContext;
using DatabaseLayer.Repositories;
using DataBaseLayer.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ================= Dependency Injection =================
builder.Services.AddScoped<IBrand, BrandRepositories>();
builder.Services.AddScoped<ICategory, CategoryRepositories>();
builder.Services.AddScoped<IProduct, ProductRepositories>();

builder.Services.AddScoped<IFinancial_year, Financial_YearRepository>();
builder.Services.AddScoped<IVendor, VendorRepository>();
builder.Services.AddScoped<IPurchase, PurchaseRepository>();
builder.Services.AddScoped<IPaymentMaster, PaymentMasterRepository>();
builder.Services.AddScoped<IPurchasePayment, PurchasePaymentRepository>();
builder.Services.AddScoped<IPurchaseDetails, PurchaseDetailsRepository>();
builder.Services.AddScoped<IAdmin, AdminRepository>();
builder.Services.AddScoped<IStaffMaster, StaffMasterRepository>();
builder.Services.AddScoped<IStockMaster, StockMasterRepository>();
builder.Services.AddScoped<IOutward, OutwardRepository>();
builder.Services.AddScoped<IReciptMaster, ReciptMasterRepository>();
builder.Services.AddScoped<IReciptPayment, ReciptPaymentRepositoy>();
builder.Services.AddScoped<ISalesReturn, SalesReturnRepository>();
builder.Services.AddScoped<ICreditNote, CreditNoteRepository>();
builder.Services.AddScoped<IReturnPayment, ReturnPaymentRepository>();

// ================= Data Layer =================
builder.Services.AddDataAccessLayerServices();

builder.Services.AddControllers();

// ================= CORS =================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy
                .AllowAnyOrigin()   // React localhost access
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// ================= Swagger =================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<EmailService>();

var app = builder.Build();

// ================= Middleware Pipeline =================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");   // ✅ IMPORTANT (Enable CORS)

app.UseAuthorization();

app.MapControllers();

app.Run();