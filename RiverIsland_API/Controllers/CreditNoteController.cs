using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreditNoteController : ControllerBase
    {
        private readonly ICreditNote _manageCreditNote;

        public CreditNoteController(ICreditNote manageCreditNote)
        {
            _manageCreditNote = manageCreditNote;
        }

        // ================= CREATE =================
        [HttpPost("AddCreditNote")]
        public async Task<IActionResult> AddCreditNote([FromBody] CreditNote model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Credit note data is required"));

                var result = await _manageCreditNote.SaveCreditNote(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}