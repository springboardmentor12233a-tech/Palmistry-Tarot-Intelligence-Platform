from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Reading
from .services.pdf_service import pdf_service

class PDFGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            r = Reading.objects.get(id=pk, user=request.user)
            pdf_path = pdf_service.generate_report(r)
            r.pdf_report_path = pdf_path
            
            if r.status != 'completed':
                r.status = 'report_generated'
                
            r.save()
            return Response({"detail": "PDF generated", "path": pdf_path}, status=status.HTTP_200_OK)
        except Reading.DoesNotExist:
            return Response({"detail": "Reading not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
