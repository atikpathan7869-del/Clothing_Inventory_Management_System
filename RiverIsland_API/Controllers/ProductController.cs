using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProduct _manageProduct;

        public ProductController(IProduct manageProduct)
        {
            _manageProduct = manageProduct;
        }

        // ✅ GET ALL
        [HttpGet("GetAllProducts")]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var result = await _manageProduct.GetAllProducts();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY ID
        [HttpGet("GetProductById/{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            try
            {
                var result = await _manageProduct.GetProductById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ SAVE
        [HttpPost("SaveProduct")]
        public async Task<IActionResult> SaveProduct([FromBody] Product product)
        {
            try
            {
                if (product == null)
                    return BadRequest(new ResponseResult("Fail", "Product data is required"));

                var result = await _manageProduct.SaveProduct(product);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE
        [HttpPut("UpdateProduct/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            try
            {
                if (product == null)
                    return BadRequest(new ResponseResult("Fail", "Product data is required"));

                var result = await _manageProduct.UpdateProduct(id, product);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }


        // ✅ DELETE
        [HttpDelete("DeleteProduct/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var result = await _manageProduct.DeleteProduct(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}
