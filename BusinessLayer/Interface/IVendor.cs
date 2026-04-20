using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    

        public interface IVendor
        {
            // CREATE
           public Task<ResponseResult> SaveVendor(Vendor vendor);

            // READ - Get All
            public Task<ResponseResult> GetAllVendors();

            // READ - Get By Id
            public Task<ResponseResult> GetVendorById(int id);

            // UPDATE
            public Task<ResponseResult> UpdateVendor(Vendor vendor);

            // DELETE (Soft Delete Recommended)
            public Task<ResponseResult> DeleteVendor(int id);
        }

    }

