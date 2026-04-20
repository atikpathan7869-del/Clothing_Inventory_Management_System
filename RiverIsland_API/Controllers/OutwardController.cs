using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OutwardController : ControllerBase
    {
        private readonly IOutward _manageOutward;

        public OutwardController(IOutward manageOutward)
        {
            _manageOutward = manageOutward;
        }

        // ================= GET ALL =================
        [HttpGet("GetAllOutwards")]
        public async Task<IActionResult> GetAllOutwards()
        {
            try
            {
                var result = await _manageOutward.GetAllOutwards();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("GetOutwardById/{id}")]
        public async Task<IActionResult> GetOutwardById(int id)
        {
            try
            {
                var result = await _manageOutward.GetOutwardById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        [HttpPost("SaveOutward")] // Isse URL banega /api/Outward/SaveOutward
        public async Task<IActionResult> SaveOutward(Outword model)
        {
            try
            {
                var result = await _manageOutward.SaveOutward(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
        // ================= UPDATE =================
        [HttpPut("UpdateOutward")]
        public async Task<IActionResult> UpdateOutward([FromBody] Outword model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Outward data is required"));

                var result = await _manageOutward.UpdateOutward(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= DELETE =================
        [HttpDelete("DeleteOutward/{id}")]
        public async Task<IActionResult> DeleteOutward(int id)
        {
            try
            {
                var result = await _manageOutward.DeleteOutward(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}