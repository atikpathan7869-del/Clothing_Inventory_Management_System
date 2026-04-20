using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class ResponseResult
    {
        public ResponseResult(string Status, object Result)
        {
            this.Status = Status;
            this.Result = Result;
            
        }
        public string Status { get; set; }

        public object Result { get; set; }
    }
}
