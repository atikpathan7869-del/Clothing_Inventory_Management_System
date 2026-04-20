using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BusinessLayer.Model
{
    public class Admin
    {
       
        public int Id { get; set; }
        public string Full_Name { get; set; } = string.Empty;
        public string Contact_No { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = System.DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}