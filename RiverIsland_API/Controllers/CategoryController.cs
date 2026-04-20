using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategory _manageCategory;

        public CategoryController(ICategory manageCategory)
        {
            _manageCategory = manageCategory;
        }

        // ✅ GET ALL CATEGORIES
        [HttpGet("GetAllCategories")]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var result = await _manageCategory.GetAllCategories();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET CATEGORY BY ID
        [HttpGet("GetCategoryById/{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var result = await _manageCategory.GetCategoryById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ SAVE CATEGORY
        [HttpPost("SaveCategory")]
        public async Task<IActionResult> SaveCategory([FromBody] Category category)
        {
            try
            {
                if (category == null)
                    return BadRequest(new ResponseResult("Fail", "Category data is required"));

                var result = await _manageCategory.SaveCategory(category);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE CATEGORY
        [HttpPut("UpdateCategory")]
        public async Task<IActionResult> UpdateCategory([FromBody] Category category)
        {
            try
            {
                if (category == null)
                    return BadRequest(new ResponseResult("Fail", "Category data is required"));

                var result = await _manageCategory.UpdateCategory(category);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ DELETE CATEGORY
        [HttpDelete("DeleteCategory/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var result = await _manageCategory.DeleteCategory(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}
