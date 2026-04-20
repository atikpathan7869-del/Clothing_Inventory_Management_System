using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReciptpaymentController : ControllerBase
    {
        private readonly IReciptPayment _reciptPayment;

        public ReciptpaymentController(IReciptPayment reciptPayment)
        {
            _reciptPayment = reciptPayment;
        }

        // ================= GET ALL =================
        [HttpGet("GetAllReciptPayments")]
        public async Task<IActionResult> GetAllReciptPayments()
        {
            try
            {
                var result = await _reciptPayment.GetAllReciptPayments();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("GetReciptPaymentById/{id}")]
        public async Task<IActionResult> GetReciptPaymentById(int id)
        {
            try
            {
                var result = await _reciptPayment.GetReciptPaymentById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY RECEIPT =================
        [HttpGet("GetReciptPaymentsByReciptId/{reciptMasterId}")]
        public async Task<IActionResult> GetReciptPaymentsByReciptId(int reciptMasterId)
        {
            try
            {
                var result = await _reciptPayment.GetReciptPaymentsByReciptId(reciptMasterId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= ADD =================
        [HttpPost("AddReciptPayment")]
        public async Task<IActionResult> AddReciptPayment([FromBody] ReciptPayment model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Payment data is required"));

                var result = await _reciptPayment.SaveReciptPayment(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= UPDATE =================
        [HttpPut("UpdateReciptPayment")]
        public async Task<IActionResult> UpdateReciptPayment([FromBody] ReciptPayment model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Payment data is required"));

                var result = await _reciptPayment.UpdateReciptPayment(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= DELETE =================
        [HttpDelete("DeleteReciptPayment/{id}")]
        public async Task<IActionResult> DeleteReciptPayment(int id)
        {
            try
            {
                var result = await _reciptPayment.DeleteReciptPayment(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}