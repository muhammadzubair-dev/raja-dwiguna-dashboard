import React from 'react';

import logoImage from '../../assets/logo.png';
import moment from 'moment';
import { NumberFormatter } from '@mantine/core';
import separateString from '../../helpers/separateString';
import { useQuery } from 'react-query';
import {
  useGetFinanceInvoiceSettings,
  useGetInvoiceTotalPaid,
} from '../../helpers/apiHelper';

const PrintInvoice = ({ data }) => {
  const { data: dataSettings, isLoading: isLoadingSettings } = useQuery(
    ['finance-invoice-settings'],
    () => useGetFinanceInvoiceSettings()
  );

  const { data: dataTotalPaid, isLoading: isLoadingTotalPaid } = useQuery(
    ['total-paid', data?.reference_number],
    () => useGetInvoiceTotalPaid({ reference_number: data?.reference_number }),
    { enabled: !!data?.reference_number }
  );

  const settings = dataSettings?.response;
  const paid = dataTotalPaid?.response?.payment || 0;

  return (
    <div>
      <div
        id="invoice-to-capture"
        style={{
          position: 'absolute',
          left: '-99999px', // Render offscreen
          padding: '20px',
          backgroundColor: '#ffffff',
          color: '#000000',
          border: '1px solid #000000',
          width: '210mm', // A4 width for proper scaling
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img height={50} src={logoImage} alt="logo" />
            <h4 style={{ margin: 0 }}>PT Raja Dwiguna Semesta</h4>
          </div>
          <h3 style={{ textAlign: 'right', margin: 0 }}>INVOICE</h3>
        </div>

        <div style={{ display: 'flex', marginTop: 10, fontSize: 14 }}>
          <div
            style={{
              flex: 2,
              display: 'flex',
              gap: 16,
            }}
          >
            <div>
              <p style={{ margin: 0 }}>To</p>
              <p style={{ margin: 0 }}>Address</p>
            </div>
            <div>
              <p style={{ margin: 0 }}>: {data?.client}</p>
              <p style={{ margin: 0 }}>: {data?.client_address}</p>
            </div>
          </div>
          <div
            style={{
              flex: 1.3,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 16,
            }}
          >
            <div>
              <p style={{ margin: 0 }}>Invoice Number</p>
              <p style={{ margin: 0 }}>Date</p>
              <p style={{ margin: 0 }}>Due Date</p>
            </div>
            <div>
              <p style={{ margin: 0 }}>: {data?.reference_number}</p>
              <p style={{ margin: 0 }}>
                :{' '}
                {data?.invoice_date &&
                  moment(data?.invoice_date).format('DD MMMM YYYY')}
              </p>
              <p style={{ margin: 0 }}>
                :{' '}
                {data?.invoice_date &&
                  moment(data?.due_date).format('DD MMMM YYYY')}
              </p>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12 }}>Attention: Finance Division</p>

        <table
          style={{
            width: '100%',
            fontSize: 14,
            borderCollapse: 'collapse',
          }}
        >
          <thead style={{ fontSize: 12 }}>
            <tr>
              <th
                style={{
                  width: 20,
                  border: '1px solid #ddd',
                  padding: '4px 14px',
                }}
              >
                NO
              </th>
              <th style={{ border: '1px solid #ddd', padding: '4px 14px' }}>
                DESCRIPTION
              </th>
              <th
                style={{
                  width: 20,
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  padding: '4px 14px',
                }}
              >
                QTY
              </th>
              <th style={{ border: '1px solid #ddd', padding: '4px 14px' }}>
                UNIT PRICE
              </th>
              <th style={{ border: '1px solid #ddd', padding: '4px 14px' }}>
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody>
            {(data?.list_invoice_item || []).map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    padding: '6px 14px',
                  }}
                >
                  {index + 1}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '0 14px' }}>
                  {item.description}
                </td>
                <td
                  style={{
                    textAlign: 'center',
                    width: 20,
                    border: '1px solid #ddd',
                    padding: '6px 14px',
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    padding: '6px 14px',
                  }}
                >
                  <NumberFormatter
                    value={item.unit_price}
                    prefix="Rp "
                    decimalScale={2}
                    thousandSeparator="."
                    decimalSeparator=","
                  />
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    padding: '6px 14px',
                  }}
                >
                  <NumberFormatter
                    value={item.amount}
                    prefix="Rp "
                    decimalScale={2}
                    thousandSeparator="."
                    decimalSeparator=","
                  />
                </td>
              </tr>
            ))}
            {/* WHT */}
            {/* {data?.with_holding_tax > 0 && (
              <tr>
                <td
                  style={{
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    padding: '6px 14px',

                    fontSize: 14,
                  }}
                  colSpan="4"
                >
                  WHT 23 ({data?.with_holding_tax_percentage}%)
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    padding: '6px 14px',

                    fontSize: 14,
                  }}
                  colSpan="4"
                >
                  (
                  <NumberFormatter
                    value={data?.with_holding_tax || 0}
                    prefix="Rp "
                    decimalScale={2}
                    thousandSeparator="."
                    decimalSeparator=","
                  />
                  )
                </td>
              </tr>
            )} */}

            {/* VAT */}
            {data?.value_added_tax > 0 && (
              <tr>
                <td
                  style={{
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    padding: '6px 14px',

                    fontSize: 14,
                  }}
                  colSpan="4"
                >
                  VAT ({data?.value_added_tax_percentage}%)
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    padding: '6px 14px',

                    fontSize: 14,
                  }}
                  colSpan="4"
                >
                  (
                  <NumberFormatter
                    value={data?.value_added_tax || 0}
                    prefix="Rp "
                    decimalScale={2}
                    thousandSeparator="."
                    decimalSeparator=","
                  />
                  )
                </td>
              </tr>
            )}

            {/* PAID */}
            {paid > 0 && (
              <tr>
                <td
                  style={{
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    padding: '6px 14px',

                    fontSize: 14,
                  }}
                  colSpan="4"
                >
                  Paid
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    border: '1px solid #ddd',
                    padding: '6px 14px',

                    fontSize: 14,
                  }}
                  colSpan="4"
                >
                  (
                  <NumberFormatter
                    value={paid}
                    prefix="Rp "
                    decimalScale={2}
                    thousandSeparator="."
                    decimalSeparator=","
                  />
                  )
                </td>
              </tr>
            )}

            {/* TOTAL */}
            <tr>
              <td
                style={{
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  padding: '6px 14px',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
                colSpan="4"
              >
                TOTAL
              </td>
              <td
                style={{
                  textAlign: 'right',
                  border: '1px solid #ddd',
                  padding: '6px 14px',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
                colSpan="4"
              >
                <NumberFormatter
                  value={
                    (data?.amount || 0) + (data?.with_holding_tax || 0) - paid
                  }
                  prefix="Rp "
                  decimalScale={2}
                  thousandSeparator="."
                  decimalSeparator=","
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            marginTop: 30,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: 32,
          }}
        >
          <div style={{ fontSize: 12 }}>
            <strong>PAYMENT DETAILS</strong>
            <div style={{ display: 'flex', gap: 12 }}>
              <div>
                <p style={{ marginTop: 0 }}>Transfer to Account</p>
                <p style={{ marginTop: -12 }}>Account Name</p>
                <p style={{ marginTop: -12 }}>Account Number</p>
                <p style={{ marginTop: -12 }}>Contact Person</p>
              </div>
              <div>
                <p style={{ marginTop: 0 }}>: {data?.bank_name}</p>
                <p style={{ marginTop: -12 }}>: {data?.bank_account}</p>
                <p style={{ marginTop: -12 }}>
                  : {separateString(data?.bank_account_number)}
                </p>
                <p style={{ marginTop: -12 }}>
                  : {settings?.contact_person_name} - {settings?.contact_person}
                </p>
              </div>
            </div>
            <div style={{ border: '1px solid #ccc', padding: 4, fontSize: 12 }}>
              <p style={{ margin: 0 }}>Notes:</p>
              <pre style={{ margin: 0, maxWidth: 300, lineHeight: 1.2 }}>
                {data?.notes}
              </pre>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 12,
              fontWeight: 600,
              paddingRight: 20,
            }}
          >
            <p style={{ margin: 0 }}>Hormat Saya</p>
            <div
              style={{
                height: 85,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  color: '#ccc',
                }}
              >
                Materai
              </p>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  width: 212,
                  textAlign: 'center',
                }}
              >
                {settings?.name}
              </p>
              <div style={{ borderTop: '1px solid #000' }}>
                <p
                  style={{
                    margin: 0,

                    textAlign: 'center',
                  }}
                >
                  {settings?.position}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintInvoice;
