using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandController : ControllerBase
    {
        private readonly IBrand _manageBrand;

        public BrandController(IBrand manageBrand)
        {
            _manageBrand = manageBrand;
        }

        // ✅ GET ALL
        [HttpGet("GetAllBrands")]
        public async Task<IActionResult> GetAllBrands()
        {
            try
            {
                var result = await _manageBrand.GetAllBrands();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY ID
        [HttpGet("GetBrandById/{id}")]
        public async Task<IActionResult> GetBrandById(int id)
        {
            try
            {
                var result = await _manageBrand.GetBrandById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ SAVE
        [HttpPost("SaveBrand")]
        public async Task<IActionResult> SaveBrand([FromBody] Brand brand)
        {
            try
            {
                if (brand == null)
                    return BadRequest(new ResponseResult("Fail", "Brand data is required"));

                var result = await _manageBrand.SaveBrand(brand);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE
        [HttpPut("UpdateBrand")]
        public async Task<IActionResult> UpdateBrand([FromBody] Brand brand)
        {
            try
            {
                if (brand == null)
                    return BadRequest(new ResponseResult("Fail", "Brand data is required"));

                var result = await _manageBrand.UpdateBrand(brand);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ DELETE
        [HttpDelete("DeleteBrand/{id}")]
        public async Task<IActionResult> DeleteBrand(int id)
        {
            try
            {
                var result = await _manageBrand.DeleteBrand(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}
