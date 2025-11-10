import React from 'react';
import PropTypes from 'prop-types';

// --- Table Component with Tailwind CSS ---
const Table = ({ columns, data, striped = true, hoverable = true, className = '' }) => {
  return (
    <div className="overflow-x-auto w-full rounded-lg border border-[#3B4252]">
      <table className={`min-w-full text-sm text-left border-collapse ${className}`}>
        <thead className="bg-[#1F2335] text-[#C0CAF5]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-3 font-semibold border-b border-[#3B4252] text-center"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[#A9B1D6]">
          {data.map((row, rowIndex) => {
            const rowClasses = `
              ${striped && rowIndex % 2 === 1 ? 'bg-[#24283B]/60' : 'bg-[#24283B]'} 
              ${hoverable ? 'hover:bg-[#1F2335]/80' : ''} 
              transition-colors
            `;
            return (
              <tr key={rowIndex} className={rowClasses}>
                {columns.map((col) => (
                  <td
                    key={col.accessor}
                    className="px-4 py-3 border-b border-[#3B4252]"
                  >
                    {row[col.accessor]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  striped: PropTypes.bool,
  hoverable: PropTypes.bool,
  className: PropTypes.string,
};

export default Table;
