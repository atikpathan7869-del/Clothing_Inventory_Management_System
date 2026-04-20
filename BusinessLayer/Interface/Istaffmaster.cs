using BusinessLayer.Models;
using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IStaffMaster
    {
        public Task<ResponseResult> SaveStaff(StaffMaster model);

        public Task<ResponseResult> GetAllStaff();

        public Task<ResponseResult> GetStaffById(int id);

        public Task<ResponseResult> UpdateStaff(StaffMaster model);

        public Task<ResponseResult> DeleteStaff(int id);
      public  Task<ResponseResult> LoginStaff(string identifier, string password);
    }
}
