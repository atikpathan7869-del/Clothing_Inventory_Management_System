using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesReturnController : ControllerBase
    {
        private readonly ISalesReturn _manageSalesReturn;

        public SalesReturnController(ISalesReturn manageSalesReturn)
        {
            _manageSalesReturn = manageSalesReturn;
        }

        // ================= GET ALL =================
        [HttpGet("GetAllSalesReturns")]
        public async Task<IActionResult> GetAllSalesReturns()
        {
            try
            {
                var result = await _manageSalesReturn.GetAllSalesReturns();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("GetSalesReturnById/{id}")]
        public async Task<IActionResult> GetSalesReturnById(int id)
        {
            try
            {
                var result = await _manageSalesReturn.GetSalesReturnById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY RECEIPT =================
        [HttpGet("GetSalesReturnsByReceiptId/{ReciptNo}/{FinancialYearId}")]
        public async Task<IActionResult> GetSalesReturnsByReceiptId(int ReciptNo, int FinancialYearId)
        {
            try
            {
                var result = await _manageSalesReturn.GetSalesReturnsByReceiptId(ReciptNo,FinancialYearId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= SAVE =================
        [HttpPost("AddSalesReturn")]
        public async Task<IActionResult> AddSalesReturn([FromBody] SalesReturn model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "SalesReturn data is required"));

                var result = await _manageSalesReturn.SaveSalesReturn(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= UPDATE =================
        [HttpPut("UpdateSalesReturn")]
        public async Task<IActionResult> UpdateSalesReturn([FromBody] SalesReturn model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "SalesReturn data is required"));

                var result = await _manageSalesReturn.UpdateSalesReturn(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= DELETE =================
        [HttpDelete("DeleteSalesReturn/{id}")]
        public async Task<IActionResult> DeleteSalesReturn(int id)
        {
            try
            {
                var result = await _manageSalesReturn.DeleteSalesReturn(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
        [HttpGet("GetSalesReturnsByMobile/{mobileNo}/{financialYearId}")]
        public async Task<IActionResult> GetSalesReturnsByMobile(string mobileNo, int financialYearId)
        {
            try
            {
                var result = await _manageSalesReturn.GetSalesReturnsByMobile(mobileNo, financialYearId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
        [HttpPost("AddSalesReturnExchange")]
        public async Task<IActionResult> AddSalesReturnExchange([FromBody] SalesReturn model)
        {
            try
            {
                var result = await _manageSalesReturn.SaveSalesReturnExchange(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}