using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StockMasterController : ControllerBase
    {
        private readonly IStockMaster _manageStock;

        public StockMasterController(IStockMaster manageStock)
        {
            _manageStock = manageStock;
        }

        // ================= GET ALL =================
        [HttpGet("GetAllStock")]
        public async Task<IActionResult> GetAllStock()
        {
            try
            {
                var result = await _manageStock.GetAllStock();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("GetStockById/{id}")]
        public async Task<IActionResult> GetStockById(int id)
        {
            try
            {
                var result = await _manageStock.GetStockById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= SAVE =================
        [HttpPost("AddStock")]
        public async Task<IActionResult> AddStock([FromBody] StockMaster model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Stock data is required"));

                var result = await _manageStock.SaveStock(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= UPDATE =================
        [HttpPut("UpdateStock")]
        public async Task<IActionResult> UpdateStock([FromBody] StockMaster model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Stock data is required"));

                var result = await _manageStock.UpdateStock(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= DELETE (Soft) =================
        [HttpDelete("DeleteStock/{id}")]
        public async Task<IActionResult> DeleteStock(int id)
        {
            try
            {
                var result = await _manageStock.DeleteStock(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }


        [HttpGet("GetStockByBarcode/{barcode}")]
        public async Task<IActionResult> GetStockByBarcode(string barcode)
        {
            try
            {
                var result = await _manageStock.GetStockByBarcode(barcode);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET AVAILABLE STOCK =================
        // Returns only items with Qty > 0 and Not Deleted
        [HttpGet("AvaliableStock" +
            "")]
        public async Task<IActionResult> AvaliableStock()
        {
            try
            {
                var result = await _manageStock.AvaliableStock();

                // If result is Fail, return as BadRequest or 404
                if (result.Status == "Fail")
                    return NotFound(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

    }
}