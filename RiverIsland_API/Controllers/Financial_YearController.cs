using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Financial_YearController : ControllerBase
    {
        private readonly IFinancial_year _financialYear;

        public Financial_YearController(IFinancial_year financialYear)
        {
            _financialYear = financialYear;
        }

        // ================= GET ALL =================
        [HttpGet("GetAllFinancialYears")]
        public async Task<IActionResult> GetAllFinancialYears()
        {
            try
            {
                var result = await _financialYear.listFinancialyear();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("GetFinancialYearById/{id}")]
        public async Task<IActionResult> GetFinancialYearById(int id)
        {
            try
            {
                var result = await _financialYear.detailFinancialyear(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= SAVE =================
        [HttpPost("AddFinancialYear")]
        public async Task<IActionResult> AddFinancialYear([FromBody] Financial_year model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Financial Year data is required"));

                var result = await _financialYear.saveFinancialyear(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= UPDATE =================
        [HttpPut("UpdateFinancialYear/{id}")]
        public async Task<IActionResult> UpdateFinancialYear(int id, [FromBody] Financial_year model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Financial Year data is required"));

                var result = await _financialYear.updateFinancialyear(model, id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= DELETE =================
        [HttpDelete("DeleteFinancialYear/{id}")]
        public async Task<IActionResult> DeleteFinancialYear(int id)
        {
            try
            {
                var result = await _financialYear.deleteFinancialyear(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}