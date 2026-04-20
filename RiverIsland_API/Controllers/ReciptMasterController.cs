using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReciptMasterController : ControllerBase
    {
        private readonly IReciptMaster _manageRecipt;

        public ReciptMasterController(IReciptMaster manageRecipt)
        {
            _manageRecipt = manageRecipt;
        }

        // ================= GET ALL =================
        [HttpGet("GetAllRecipts")]
        public async Task<IActionResult> GetAllRecipts()
        {
            try
            {
                var result = await _manageRecipt.GetAllRecipts();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY ID =================
        // ================= GET BY ID =================
        // Path: ReciptMasterController.cs

        [HttpGet("GetReciptById")] // 👈 Yahan se /{id} ko bilkul delete kar dein
        public async Task<IActionResult> GetReciptById([FromQuery] int id) // 👈 [FromQuery] lagana zaroori hai
        {
            try
            {
                // Ye aapka repository method call karega jahan aapne ReciptNo logic likha hai
                var result = await _manageRecipt.GetReciptById(id);

                if (result == null || result.Status == "Fail")
                    return NotFound(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
        
        
        
        
        // ================= SAVE =================
        [HttpPost("AddRecipt")]
        public async Task<IActionResult> AddRecipt([FromBody] ReciptMaster model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Receipt data is required"));

                var result = await _manageRecipt.SaveRecipt(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= UPDATE =================
        [HttpPut("UpdateRecipt")]
        public async Task<IActionResult> UpdateRecipt([FromBody] ReciptMaster model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Receipt data is required"));

                var result = await _manageRecipt.UpdateRecipt(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= DELETE =================
        [HttpDelete("DeleteRecipt/{id}")]
        public async Task<IActionResult> DeleteRecipt(int id)
        {
            try
            {
                var result = await _manageRecipt.DeleteRecipt(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
        // ================= SETTLE DUES (PAYMENT) =================
        [HttpPost("AddDuesPayment")]
        public async Task<IActionResult> AddDuesPayment([FromBody] ReciptPayment model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Payment data is required"));

                var result = await _manageRecipt.AddDuesPayment(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}